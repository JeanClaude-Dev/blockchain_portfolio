# 🌐 Solana Metadata Minting & Arweave Integration

Este projeto é um microserviço em Node.js projetado para automatizar o processo de criação de metadados para tokens na rede **Solana**, utilizando o protocolo **Metaplex** e garantindo o armazenamento imutável de mídias e JSONs através da rede **Arweave**.

## 🛠️ Stack Tecnológica

- **Backend:** Node.js com Express
- **Blockchain:** Solana Web3.js & Metaplex Foundation (Umi)
- **Armazenamento:** Arweave (Permaweb)
- **Banco de Dados:** MySQL
- **Segurança:** Criptografia AES-256-CBC para chaves privadas

## 🚀 Funcionalidades

- **Gerenciamento de Chaves:** Recupera e descriptografa chaves de carteiras "pagadoras" diretamente do banco de dados MySQL.
- **Upload Descentralizado:** Faz o upload automático de ativos (PNG) para a rede Arweave.
- **Metadados Dinâmicos:** Gera arquivos JSON de metadados seguindo o padrão SPL-Token.
- **Interação On-Chain:** Cria a `Metadata Account V3` no ecossistema Solana para associar o token ao seu URI imutável.

## 📋 Como Funciona (Workflow)

1. **Request:** O servidor recebe uma chamada via URL com os parâmetros do projeto.
2. **Database:** Busca o endereço do token e a chave secreta da carteira pagadora.
3. **Arweave Step 1:** Upload da imagem do token para gerar uma URL permanente.
4. **JSON Metadata:** Criação do arquivo de metadados associando a URL da imagem.
5. **Arweave Step 2:** Upload do arquivo JSON de metadados.
6. **Solana Mint:** Envio da transação para a Solana via Metaplex para oficializar os metadados do token.

## 🔧 Configuração

1. Clone o repositório:
   ```bash
   git clone [https://github.com/JeanClaude-Dev/blockchain_portfolio.git](https://github.com/JeanClaude-Dev/blockchain_portfolio.git)
