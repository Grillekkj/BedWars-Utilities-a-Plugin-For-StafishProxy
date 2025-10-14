# 🧩 BedWars Utilities — A Plugin for [Starfish Proxy](https://github.com/UrchinAPI/Starfish-Proxy)

**Tired of checking BedWars stats manually?**  
**BedWars Utilities** automates everything — from stat tracking to lobby management — built specifically as a plugin for **Starfish Proxy**.

---

## ✨ Main Features

- **Player Stats Display:** Shows stars, FKDR, beds, winstreak, and more — in chat or TAB.  
- **Auto Stats in Lobby:** Instantly see stats of anyone who talks in pre-game.  
- **Mention Stats:** Displays stats of anyone who mentions your name.  
- **Auto /who + Team Threat Ranking:** Automatically lists players and ranks enemy teams by their combined FKDR & stars.  
- **Auto Requeue:** Instantly dodge lobbies with players above your FKDR threshold.  
- **Smart Cache:** Reduces API spam by caching stats & ping.  
- **Easy Commands:** `/bwu stats`, `/bwu setthreshold`, `/bwu setkey`, and more.  

🛠 **Fully configurable** — Hypixel API, Polsu API, cache timers, thresholds, nicknames, and more.  
💡 Perfect for competitive BedWars players who want efficiency and automation.

---

## ⚙️ Installation Guide

### 📦 Step 1: Extract the Files
1. Go to the **[Releases Page](https://github.com/Grillekkj/BedWars-Utilities-a-Plugin-For-StafishProxy/releases)** and download the latest `.zip` file.
2. **Extract** the contents **inside your Starfish `plugins` folder**.  
   - Packed as `.zip` because the plugin uses a **modular structure**.  
   - There’s **one main file** for Starfish to recognize it, and multiple **module folders** for system components.  

### 🧹 Step 2: Remove the Old Plugin
This version **completely replaces and improves** the old **BedWars Utilities by [@Hexze](https://github.com/Hexze)** — fixing bugs, adding new features, and improving performance.  
➡️ You can safely **delete the old version**.

### 🔑 Step 3: API Keys Required
You’ll need two API keys for full functionality:
- **Hypixel API Key:** [https://developer.hypixel.net/](https://developer.hypixel.net/)
- **Polsu API Key:** [https://polsu.xyz/api/apikey](https://polsu.xyz/api/apikey)

### 🧠 Step 4: First Setup
After installing and starting your server:
1. Run the following commands in-game:
   ```
   /bwu setkey <your Hypixel API key>
   /bwu setpolsu <your Polsu API key>
   /bwu setnick <your Minecraft nickname>
   ```
2. Then check your configuration and adjust the plugin to your needs.  

### :speech_balloon: Step 5: Explore Commands
Type `/bwu` in-game to see **all available commands** and options.

## 🔗 Links
- **Starfish Proxy Repository:** [UrchinAPI/Starfish-Proxy](https://github.com/UrchinAPI/Starfish-Proxy)  
- **BedWars Utilities Plugin Repository:** [Grillekkj/BedWars-Utilities-a-Plugin-For-StafishProxy](https://github.com/Grillekkj/BedWars-Utilities-a-Plugin-For-StafishProxy)
- **Urchin Discord:** [https://discord.gg/WSdrmCkD3q](https://discord.gg/WSdrmCkD3q)
