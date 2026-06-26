# Migração: Zeno.fm → AzuraCast (gratuito, open-source)

## Por que migrar?

| Aspecto | Zeno.fm (gratuito) | AzuraCast (self-hosted) |
|---|---|---|
| Limite de ouvintes | ~100 simultâneos | Ilimitado (depende do servidor) |
| Custo | Gratuito com limite | Gratuito (VPS ~R$25/mês) |
| Controle | Terceiro | 100% seu |
| SLA | Sem garantia | Você define |
| Latência | Variável | Baixa (< 5 s) |
| Formatos | MP3 | MP3, AAC, OGG, HLS, WebRTC |

---

## Opção 1 — AzuraCast (recomendado, gratuito)

### Requisitos mínimos de servidor
- VPS com **1 vCPU, 512 MB RAM, Ubuntu 22.04**
- Custo: ~R$25/mês (Hostinger, Contabo, DigitalOcean, Hetzner)

### Instalação (um único comando)
```bash
# No servidor via SSH:
curl -fsSL https://raw.githubusercontent.com/AzuraCast/AzuraCast/main/docker.sh | bash -s -- install
```

Acesse `http://IP_DO_SERVIDOR` e siga o assistente de configuração.

### Após instalação
1. Crie uma estação em **Stations → Add Station**
2. Vá em **Mount Points** e copie a URL do ponto de montagem
   - Formato: `https://radio.seudominio.com/listen/NOME_ESTACAO/radio.mp3`
3. No `templates/index.html`, substitua:
   ```html
   <!-- ANTES -->
   <source src="https://stream.zeno.fm/SEU_ID_EXCLUSIVO" type="audio/mpeg" />

   <!-- DEPOIS -->
   <source src="https://radio.seudominio.com/listen/NOME_ESTACAO/radio.mp3" type="audio/mpeg" />
   <source src="https://radio.seudominio.com/listen/NOME_ESTACAO/playlist.m3u8" type="application/vnd.apple.mpegurl" />
   ```
4. No `static/js/sw.js`, adicione o domínio ao bypass:
   ```js
   const CACHE_BYPASS_PATTERNS = [
     "spotify.com",
     "radio.seudominio.com",  // ← adicione aqui
   ];
   ```

---

## Opção 2 — Sem servidor próprio (zero custo, limitado)

Se não quiser um VPS, use um serviço de streaming gratuito com URL Icecast pública:

| Serviço | URL Icecast | Limite gratuito |
|---|---|---|
| **Broadwave** | Sim | 50 ouvintes |
| **Shoutca.st** | Sim | 1 estação, baixa qualidade |
| **Peercast** | P2P (sem servidor central) | Sem limite formal |
| **Liquidsoap + Render.com** | Manual | Plano free (750h/mês) |

Para qualquer um, o processo é o mesmo: obter a URL do stream e colar no `<source src="...">`.

---

## Opção 3 — Transmissão local com Icecast (desenvolvimento)

```bash
# Instalar
sudo apt install icecast2 liquidsoap

# Configurar icecast2 em /etc/icecast2/icecast.xml
# Iniciar
sudo systemctl start icecast2

# Stream URL local: http://localhost:8000/stream.mp3
```

---

## Notas sobre o SW (Service Worker)

O `sw.js` foi atualizado para bypassar automaticamente qualquer URL que:
- contenha `/listen/` no path (padrão AzuraCast)
- termine em `.mp3` ou `.m3u8`
- tenha `Accept: audio/*` no header

Assim o player sempre busca o stream ao vivo, nunca de cache.
