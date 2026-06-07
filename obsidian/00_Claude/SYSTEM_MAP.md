# System Map — Vollständige Infrastruktur
*Stand: 2026-06-07 | Automatisch erfasst*

## Laufwerke
| Laufwerk | GB | Zweck |
|---|---|---|
| C:\ | 887 | Windows, Python 3.14, User-Configs |
| D:\ | 932 | Dev-Code, Assets, Tools |
| I:\ | 954 | **KI-Hub** (Hauptlaufwerk) |
| Z:\ | 977 | Medien-Archiv |

## I:\ Struktur
```
I:\
├── 00_System\          → Systemskripte, Configs
├── 01_Models\          → ⚠️ JUNCTIONS — nie verschieben
│   └── Ollama_Archive\ → 101GB, 17 Modelle
├── 02_APPS\
│   ├── pinokio-apps\   → 19 Apps (ComfyUI, LlamaFactory etc.)
│   └── pinokio-core\
├── 03_AI_STACK\        → Forschungs-Repos (langchain, flowise, autogpt...)
├── 04_AGENTS\          → ⭐ HAUPTPROJEKT BaristaState
│   └── baristastate\BARISTA_STATE\  → Workstation + Agents 01-13
├── 05_WORKSPACE\
│   ├── claude\
│   └── tasks\
├── 08_Workspace\
│   └── qdrant_data\
├── Münchner Kindl\     → ⭐ PfandChip Projekt
└── MASTER_INDEX.md
```

## Services & Ports
| Service | Port | Status | Start |
|---|---|---|---|
| Ollama | 11434 | via START.bat | `C:\Users\knips\AppData\Local\Programs\Ollama\ollama.exe` |
| Qdrant | 6333 | **Läuft** (Docker) | Docker / ALLES_STARTEN.bat |
| ComfyUI | 8188 | via Pinokio | ALLES_STARTEN.bat |
| n8n | 5678 | - | START_N8N.bat |
| KI-Bridge | 8765 | - | - |
| Master Panel | 3001 | - | - |
| Cyber-Canvas | 8080 | - | - |

## Hardware
- **GPU:** NVIDIA RTX 5070 Ti (16GB VRAM)
- **Python:** C:\Python314\python.exe (v3.14)

## KI-Modelle
| Modell | Typ | Verwendung |
|---|---|---|
| barista:7b | Custom Mistral/Llama | Hauptmodell (daily, content, orders) |
| qwen2.5:7b | Ollama | Competitor Monitor |
| qwen2.5:14b | Ollama | Weekly Learning |
| FLUX.1-schnell-fp8 | ComfyUI | Bildgenerierung (16GB) |

## Aktive Projekte
| Projekt | Pfad | Tech |
|---|---|---|
| PfandChip | `I:\Münchner Kindl\` | React 19 + Supabase + Docker |
| BaristaState Workstation | `I:\04_AGENTS\baristastate\BARISTA_STATE\` | Python + Ollama |
| BaristaState Web | `C:\Users\knips\barista_state_web\` | React 18 + Supabase |
| Command Center | `C:\Users\knips\BaristaState\` | Vanilla HTML + Ollama |

## GitHub
- Account: github.com/baristastate
- Token: `I:\04_AGENTS\baristastate\.env`

## Supabase-Projekte
| Name | URL |
|---|---|
| barista-hub | unyodkazynitjbibgfth.supabase.co |
| PfandChip | sqnabkuztotuhvxzcvfy.supabase.co (West EU) |

## Python Agents (Scheduled)
| Agent | Datei | Zeitplan |
|---|---|---|
| Daily Intelligence | 01_daily_intelligence.py | 07:00 täglich |
| Competitor Monitor | 02_competitor_monitor.py | alle 2h ab 06:00 |
| Content Generator | 03_content_generator.py | Mo/Mi/Fr 09:00 |
| Order Handler | 04_order_handler.py | on-demand |
| Weekly Learning | 05_weekly_learning.py | Montag 06:00 |
**Basis:** `I:\04_AGENTS\baristastate\BARISTA_STATE\agents\`

## Starter-Skripte
| Skript | Funktion |
|---|---|
| Desktop\ALLES_STARTEN.bat | Qdrant + ComfyUI + Control Server + Dashboard |
| BaristaState\START.bat | Ollama + barista:7b + Command Center |
| I:\04_AGENTS\baristastate\LAUNCH.bat | Agents Starter |
