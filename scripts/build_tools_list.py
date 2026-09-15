#!/usr/bin/env python3
"""Regenerate the tool list in tools/index.html from each tools/*.html file's
own metadata. Local, filesystem-only, no network calls, no dependencies.

Each tool page's <head> must declare:
    <title>Tool Name &middot; Malcolm Keyes</title>
    <meta name="description" content="One or two sentence description.">
    <meta name="tool:category" content="Category">
    <meta name="tool:order" content="10">

Usage:
    uv run python scripts/build_tools_list.py          # regenerate in place
    uv run python scripts/build_tools_list.py --check  # exit 1 if stale, no write
"""

import html
import sys
from html.parser import HTMLParser
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
TOOLS_DIR = REPO_ROOT / "tools"
INDEX_FILE = TOOLS_DIR / "index.html"
START_MARKER = "<!-- tools:generated:start -->"
END_MARKER = "<!-- tools:generated:end -->"
TITLE_SEPARATOR = " · "  # " · "


class ToolMetaParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self._in_title = False
        self.title = ""
        self.description = None
        self.category = None
        self.order = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "title":
            self._in_title = True
        elif tag == "meta":
            name = attrs.get("name")
            content = attrs.get("content")
            if name == "description":
                self.description = content
            elif name == "tool:category":
                self.category = content
            elif name == "tool:order":
                self.order = content

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False

    def handle_data(self, data):
        if self._in_title:
            self.title += data


def load_tool(path):
    parser = ToolMetaParser()
    parser.feed(path.read_text(encoding="utf-8"))

    name = parser.title.split(TITLE_SEPARATOR)[0].strip()
    missing = [
        label
        for label, value in [
            ("<title>", name),
            ("meta[name=description]", parser.description),
            ("meta[name=tool:category]", parser.category),
            ("meta[name=tool:order]", parser.order),
        ]
        if not value
    ]
    if missing:
        raise ValueError(f"{path.relative_to(REPO_ROOT)} is missing: {', '.join(missing)}")

    try:
        order = int(parser.order)
    except ValueError:
        raise ValueError(f"{path.relative_to(REPO_ROOT)} has non-integer tool:order: {parser.order!r}")

    return {
        "slug": path.name,
        "name": name,
        "description": parser.description,
        "category": parser.category,
        "order": order,
    }


def discover_tools():
    tools = [
        load_tool(path)
        for path in sorted(TOOLS_DIR.glob("*.html"))
        if path.name != "index.html"
    ]
    return sorted(tools, key=lambda t: (t["order"], t["name"]))


def render_list(tools):
    items = []
    for tool in tools:
        items.append(
            '      <li class="tool-item" data-name="{name}" data-category="{category}" data-order="{order}">\n'
            '        <h2><a href="/tools/{slug}">{name}</a></h2>\n'
            '        <span class="tool-category">{category}</span>\n'
            "        <p>{description}</p>\n"
            "      </li>".format(
                name=html.escape(tool["name"]),
                category=html.escape(tool["category"]),
                order=tool["order"],
                slug=html.escape(tool["slug"]),
                description=html.escape(tool["description"]),
            )
        )
    return "\n".join(items)


def build_index_html(tools):
    current = INDEX_FILE.read_text(encoding="utf-8")
    start = current.index(START_MARKER) + len(START_MARKER)
    end = current.index(END_MARKER)
    if start > end:
        raise ValueError(f"{END_MARKER} appears before {START_MARKER} in {INDEX_FILE}")
    generated = render_list(tools)
    body = "\n" + generated + "\n" if generated else "\n"
    return current[:start] + body + current[end:]


def main():
    check_only = "--check" in sys.argv[1:]
    try:
        tools = discover_tools()
        updated = build_index_html(tools)
    except ValueError as error:
        print(f"error: {error}", file=sys.stderr)
        return 1
    current = INDEX_FILE.read_text(encoding="utf-8")

    if updated == current:
        print(f"tools/index.html is up to date ({len(tools)} tool(s)).")
        return 0

    if check_only:
        print(
            "tools/index.html is out of date with tools/*.html metadata.\n"
            "Run: uv run python scripts/build_tools_list.py"
        )
        return 1

    INDEX_FILE.write_text(updated, encoding="utf-8")
    print(f"Regenerated tools/index.html with {len(tools)} tool(s).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
