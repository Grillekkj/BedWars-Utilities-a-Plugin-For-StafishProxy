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
3. Delete the readme.md file.

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
   ```
2. Then check your configuration and adjust the plugin to your needs.  

### :speech_balloon: Step 5: Explore Commands
Type `/bwu` in-game to see **all available commands** and options.

## 🖼️ Demonstration

### 📊 Auto Stats in Pre-Game Lobby
Automatically displays players' stats when they talk in the pre-game lobby.  
<img width="628" height="112" alt="image" src="https://github.com/user-attachments/assets/e47ea025-92c7-4d69-8eae-bddcfad4a4e7" />

---

### 🧾 Command to Check Everyone’s Stats
Quickly check the stats of all players in the current lobby using a simple command.  
<img width="739" height="180" alt="image" src="https://github.com/user-attachments/assets/a503150d-0afa-4197-883b-004119a9c248" />

---

### 🔁 Auto Requeue
Automatically requeues when a player exceeds your configured FKDR threshold.  
<img width="745" height="289" alt="image" src="https://github.com/user-attachments/assets/c865e3a3-f490-4e38-96b7-31e508a6b191" />

---

### 🏆 Ranking Message After Game Start
Displays a ranking message with the strongest teams once the game begins.  
<img width="762" height="110" alt="image" src="https://github.com/user-attachments/assets/c57bba8a-6163-4d58-a6e9-a25008b865a5" />

---

### 📋 Stats on TAB
Displays players’ stars, FKDR, beds, and winstreak directly on the TAB list.  
<img width="1004" height="267" alt="image" src="https://github.com/user-attachments/assets/6b3648b8-5926-457a-a729-279b2c9eda21" />

## 🔗 Links
- **Starfish Proxy Repository:** [UrchinAPI/Starfish-Proxy](https://github.com/UrchinAPI/Starfish-Proxy)  
- **BedWars Utilities Plugin Repository:** [Grillekkj/BedWars-Utilities-a-Plugin-For-StafishProxy](https://github.com/Grillekkj/BedWars-Utilities-a-Plugin-For-StafishProxy)
- **Urchin Discord:** [https://discord.gg/WSdrmCkD3q](https://discord.gg/WSdrmCkD3q)
