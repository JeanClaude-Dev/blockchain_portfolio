import os
import json
import streamlit as st
from groq import Groq
from pypdf import PdfReader
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def extrair_texto_pdf(arquivo):
    try:
        leitor = PdfReader(arquivo)
        texto = ""
        for pagina in leitor.pages:
            content = pagina.extract_text()
            if content:
                texto += content
        return texto
    except Exception as e:
        return f"Erro no PDF: {str(e)}"

# Interface
st.set_page_config(page_title="Triagem de Emails", layout="centered")

st.title("📧 Classificador de Emails")
st.write("Envie um texto ou arquivo (PDF/TXT) para análise.")

# Upload de arquivo
arquivo = st.file_uploader("Upload de arquivo", type=["pdf", "txt"])

# Campo de texto
texto_input = st.text_area("Ou cole o texto aqui:")

if st.button("Processar"):
    texto_final = ""

    # Processa arquivo
    if arquivo is not None:
        if arquivo.name.endswith(".pdf"):
            texto_final = extrair_texto_pdf(arquivo)
        elif arquivo.name.endswith(".txt"):
            texto_final = arquivo.read().decode("utf-8")

    # Se não tiver arquivo, usa texto
    if not texto_final:
        texto_final = texto_input

    if not texto_final:
        st.error("Conteúdo vazio")
    else:
        try:
            with st.spinner("Analisando..."):
                chat_completion = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    response_format={"type": "json_object"},
                    messages=[
                        {
                            "role": "system",
                            "content": """Você é um especialista em triagem de e-mails corporativos.
                            Sua tarefa é classificar o conteúdo em:
                            - Produtivo
                            - Improdutivo
                            Responda APENAS em JSON com: categoria, justificativa, resposta_sugerida."""
                        },
                        {
                            "role": "user",
                            "content": "Texto: 'Ganhe 50% de desconto em sapatos agora!'"
                        },
                        {
                            "role": "assistant",
                            "content": '{"categoria": "Improdutivo", "justificativa": "Propaganda comercial.", "resposta_sugerida": "Nenhum retorno necessário."}'
                        },
                        {
                            "role": "user",
                            "content": "Texto: 'Segue em anexo o relatório financeiro.'"
                        },
                        {
                            "role": "assistant",
                            "content": '{"categoria": "Produtivo", "justificativa": "Envio de documento de trabalho.", "resposta_sugerida": "Vou analisar e retorno."}'
                        },
                        {
                            "role": "user",
                            "content": f"Analise este conteúdo: {texto_final}"
                        }
                    ]
                )

                resultado = chat_completion.choices[0].message.content
                dados = json.loads(resultado)

                st.success("Resultado:")
                st.json(dados)

        except Exception as e:
            st.error(f"Erro no Groq: {str(e)}")