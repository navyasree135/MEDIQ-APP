"""
PDF Generator Service using WeasyPrint / Pure Python PDF Stream Renderer
=========================================================================
Converts markdown medical report explanations into styled PDF documents with custom
headers, summary sections, medication breakdown tables, and highlighted disclaimer callouts.
"""
import io
import re
from typing import Optional

from backend.core.logger import get_logger

logger = get_logger(__name__)

# Check WeasyPrint availability
try:
    # pyrefly: ignore [missing-import]
    import weasyprint
    HAS_WEASYPRINT = True
except ImportError:
    HAS_WEASYPRINT = False

try:
    # pyrefly: ignore [missing-import]
    from xhtml2pdf import pisa
    HAS_XHTML2PDF = True
except ImportError:
    HAS_XHTML2PDF = False


def escape_pdf_str(s: str) -> str:
    """Escape special characters for PDF text operators."""
    return s.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def wrap_text(text: str, max_chars: int = 75) -> list[str]:
    """Wrap plain text lines to fit PDF margin width."""
    words = text.split()
    lines = []
    current = []
    current_len = 0
    for w in words:
        if current_len + len(w) + 1 > max_chars:
            lines.append(" ".join(current))
            current = [w]
            current_len = len(w)
        else:
            current.append(w)
            current_len += len(w) + 1
    if current:
        lines.append(" ".join(current))
    return lines or [""]


def generate_pure_pdf_bytes(markdown_content: str) -> bytes:
    """
    Renders a complete multi-line PDF binary document supporting section headers,
    tables, bullet lists, and disclaimer callouts.
    """
    lines = markdown_content.splitlines()
    stream_ops = []

    # Title & Header
    stream_ops.append("BT")
    stream_ops.append("/F1 16 Tf")
    stream_ops.append("0 0.3 0.3 rg")
    stream_ops.append("40 745 Td")
    stream_ops.append("(MediQ -- Plain Language Medical Explanation) Tj")
    stream_ops.append("ET")

    # Divider Line
    stream_ops.append("0 0.5 0.5 RG")
    stream_ops.append("40 735 m 570 735 l S")

    y = 710
    for line in lines:
        stripped = line.strip()
        if not stripped or stripped.startswith("|---"):
            y -= 4
            continue

        if y < 45:
            break

        # Section Headers (e.g. **Summary**, **Breakdown**, # Title)
        if stripped.startswith("**Summary**") or stripped.startswith("**Breakdown**") or stripped.startswith("**What this might mean**") or stripped.startswith("**Things to keep in mind**") or stripped.startswith("**Disclaimer**") or stripped.startswith("# ") or stripped.startswith("## "):
            txt = stripped.replace("**", "").replace("#", "").strip()
            stream_ops.append("BT")
            stream_ops.append("/F1 12 Tf")
            stream_ops.append("0 0.35 0.35 rg")
            stream_ops.append(f"40 {y} Td")
            stream_ops.append(f"({escape_pdf_str(txt)}) Tj")
            stream_ops.append("ET")
            y -= 18

        # Table rows (| Medicine | Purpose | How to take |)
        elif stripped.startswith("|"):
            parts = [p.strip() for p in stripped.split("|") if p.strip()]
            row_txt = "  •  ".join(parts)
            stream_ops.append("BT")
            stream_ops.append("/F1 9 Tf")
            stream_ops.append("0.1 0.25 0.3 rg")
            stream_ops.append(f"50 {y} Td")
            stream_ops.append(f"({escape_pdf_str(row_txt[:85])}) Tj")
            stream_ops.append("ET")
            y -= 14

        # Bullet lines
        elif stripped.startswith("- ") or re.match(r"^\d+\.\s+", stripped):
            txt = stripped.replace("- ", "").replace("**", "")
            for w in wrap_text(txt, 75):
                if y < 45:
                    break
                stream_ops.append("BT")
                stream_ops.append("/F1 9.5 Tf")
                stream_ops.append("0.15 0.15 0.15 rg")
                stream_ops.append(f"55 {y} Td")
                stream_ops.append(f"({escape_pdf_str('• ' + w)}) Tj")
                stream_ops.append("ET")
                y -= 13

        # Standard Paragraph
        else:
            txt = stripped.replace("**", "").replace("*", "")
            for w in wrap_text(txt, 80):
                if y < 45:
                    break
                stream_ops.append("BT")
                stream_ops.append("/F1 9.5 Tf")
                stream_ops.append("0.2 0.2 0.2 rg")
                stream_ops.append(f"40 {y} Td")
                stream_ops.append(f"({escape_pdf_str(w)}) Tj")
                stream_ops.append("ET")
                y -= 13

    stream_content = "\n".join(stream_ops).encode("latin1", errors="replace")
    stream_len = len(stream_content)

    pdf_body = (
        f"%PDF-1.4\n"
        f"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
        f"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
        f"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>\nendobj\n"
        f"4 0 obj\n<< /Length {stream_len} >>\nstream\n"
    ).encode("latin1") + stream_content + (
        f"\nendstream\nendobj\n"
        f"xref\n0 5\n0000000000 65535 f \n"
        f"0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000275 00000 n \n"
        f"trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n{400 + stream_len}\n%%EOF\n"
    ).encode("latin1")

    return pdf_body


def markdown_to_html_body(md_text: str) -> str:
    """Basic converter from markdown sections to HTML tags."""
    html = md_text

    # Convert headers
    html = re.sub(r"^# (.*?)$", r'<h1 class="main-title">\1</h1>', html, flags=re.MULTILINE)
    html = re.sub(r"^## (.*?)$", r'<h2 class="section-header">\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r"^\*\*(.*?)\*\*$", r'<h3 class="section-header">\1</h3>', html, flags=re.MULTILINE)

    # Convert bold / strong
    html = re.sub(r"\*\*(.*?)\*\*", r"<strong>\1</strong>", html)

    # Convert disclaimer blockquotes
    html = re.sub(
        r"^>\s*(.*?)$",
        r'<div class="disclaimer-box"><span class="disclaimer-title">⚠️ MEDICAL DISCLAIMER</span><p>\1</p></div>',
        html,
        flags=re.MULTILINE,
    )

    # Convert bullet points
    lines = html.split("\n")
    in_list = False
    new_lines = []

    for line in lines:
        stripped = line.strip()
        if stripped.startswith("- ") or re.match(r"^\d+\.\s+", stripped):
            if not in_list:
                new_lines.append('<ul class="styled-list">')
                in_list = True
            content = re.sub(r"^(-\s+|\d+\.\s+)", "", stripped)
            new_lines.append(f"  <li>{content}</li>")
        else:
            if in_list:
                new_lines.append("</ul>")
                in_list = False
            if stripped and not stripped.startswith("<h") and not stripped.startswith("<div"):
                new_lines.append(f"<p>{stripped}</p>")
            else:
                new_lines.append(line)

    if in_list:
        new_lines.append("</ul>")

    return "\n".join(new_lines)


def generate_styled_html(markdown_content: str, report_title: str = "Medical Report Explanation") -> str:
    """Renders HTML template with modern CSS styling."""
    body_content = markdown_to_html_body(markdown_content)

    html_document = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{report_title}</title>
    <style>
        @page {{
            size: A4;
            margin: 20mm;
            @bottom-right {{
                content: "Page " counter(page) " of " counter(pages);
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                font-size: 9pt;
                color: #718096;
            }}
        }}

        body {{
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #2d3748;
            line-height: 1.6;
            font-size: 11pt;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
        }}

        .brand-header {{
            border-bottom: 3px solid #008080;
            padding-bottom: 12px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}

        .brand-title {{
            font-size: 22pt;
            font-weight: 700;
            color: #004d4d;
            margin: 0;
        }}

        .brand-subtitle {{
            font-size: 10pt;
            color: #008080;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 4px;
        }}

        .section-header {{
            font-size: 14pt;
            color: #006666;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
            margin-top: 24px;
            margin-bottom: 12px;
        }}

        .styled-list {{
            margin-top: 8px;
            margin-bottom: 16px;
            padding-left: 20px;
        }}

        .styled-list li {{
            margin-bottom: 8px;
            color: #374151;
        }}

        .disclaimer-box {{
            background-color: #fffbe6;
            border: 1px solid #ffe58f;
            border-left: 5px solid #faad14;
            border-radius: 6px;
            padding: 14px 18px;
            margin-top: 28px;
            margin-bottom: 16px;
        }}

        .disclaimer-title {{
            font-weight: bold;
            color: #d48806;
            font-size: 10.5pt;
            display: block;
            margin-bottom: 4px;
        }}

        .disclaimer-box p {{
            margin: 0;
            font-size: 9.5pt;
            color: #595959;
        }}

        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
        }}

        th, td {{
            border: 1px solid #e2e8f0;
            padding: 10px 12px;
            text-align: left;
        }}

        th {{
            background-color: #e6f7f7;
            color: #004d4d;
            font-weight: bold;
        }}

        .footer-note {{
            margin-top: 30px;
            text-align: center;
            font-size: 8.5pt;
            color: #a0aec0;
            border-top: 1px solid #edf2f7;
            padding-top: 12px;
        }}
    </style>
</head>
<body>
    <div class="brand-header">
        <div>
            <div class="brand-title">MediQ</div>
            <div class="brand-subtitle">Plain Language Health Report Explanation</div>
        </div>
    </div>

    {body_content}

    <div class="footer-note">
        Generated securely by MediQ Healthcare AI System • Keep this record for your medical consultations.
    </div>
</body>
</html>
"""
    return html_document


def render_pdf_bytes(html_content: str, markdown_content: str = "") -> bytes:
    """Renders HTML string to PDF binary bytes using WeasyPrint, xhtml2pdf, or pure stream renderer."""
    if HAS_WEASYPRINT:
        try:
            logger.info("Rendering PDF using WeasyPrint engine...")
            return weasyprint.HTML(string=html_content).write_pdf()
        except Exception as exc:
            logger.error(f"WeasyPrint rendering error: {exc}")

    if HAS_XHTML2PDF:
        try:
            logger.info("Rendering PDF using xhtml2pdf engine...")
            output_buffer = io.BytesIO()
            pisa_status = pisa.CreatePDF(html_content, dest=output_buffer)
            if not pisa_status.err:
                return output_buffer.getvalue()
        except Exception as exc:
            logger.error(f"xhtml2pdf rendering error: {exc}")

    # Pure Python Bytes PDF Stream Renderer
    logger.info("Using pure Python PDF stream renderer for full report content.")
    return generate_pure_pdf_bytes(markdown_content or html_content)
