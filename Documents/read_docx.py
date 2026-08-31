import zipfile
import xml.etree.ElementTree as ET

def get_docx_text(path):
    with zipfile.ZipFile(path) as docx:
        xml_content = docx.read('word/document.xml')
        tree = ET.fromstring(xml_content)
        # Find all text nodes
        namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        texts = []
        for node in tree.iter():
            if node.tag.endswith('}t'):
                if node.text:
                    texts.append(node.text)
        return texts

texts = get_docx_text('7. Diagram for reference.docx')
for i, t in enumerate(texts):
    print(f"{i}: {t}")
