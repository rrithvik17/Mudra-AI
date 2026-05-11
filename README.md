# Mudra AI ✋🕉️

**Mudra AI** is a professional-grade, real-time hand gesture recognition application specifically designed for **Kuchipudi**, a classical Indian dance form. Leveraging cutting-edge AI and computer vision, it helps students and practitioners learn, practice, and master the fundamental hand gestures (*Mudras*) with precision and grace.


## ✨ Features

- **Real-time Detection**: Powered by Google's MediaPipe, providing ultra-low latency gesture recognition.
- **Rule-based Precision**: Uses a sophisticated geometric classification engine to ensure high accuracy for traditional hand forms.
- **Educational Insights**: Deep dives into the *Navarasa* (emotions), meanings, and traditional usage of each Mudra.
- **Audio-Visual Feedback**: Interactive feedback with a traditional Indian female voice guide for an immersive learning experience.
- **Practice Mode**: A dedicated mode to test your skills and improve your muscle memory.
- **Premium Aesthetics**: A stunning, cinematic UI designed with modern dark-mode aesthetics and smooth micro-animations.

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite 8
- **AI/Vision**: MediaPipe Hands (v0.4+)
- **Styling**: Vanilla CSS (Modern CSS3 with Variables & Glassmorphism)
- **Audio**: Web Audio API with synthesized traditional voice guidance.

## 🖐️ Supported Mudras

| Mudra | Meaning | Description |
| :--- | :--- | :--- |
| **Pataka** | Flag | Represents a river, sky, or royal blessing. |
| **Tripataka** | Three-part Flag | Symbolises a crown, tree, or sacred fire. |
| **Ardhachandra** | Half Moon | Evokes Lord Shiva wearing the crescent moon. |
| **Katakamukha** | Bracelet Opening | Depicts picking flowers or holding a garland. |
| **Alapadma** | Full Lotus | Represents abundance and sacred beauty. |
| **Chandrakala** | Moon Digit | Depicts the meditative stillness of Shiva. |
| **Mrigashirsha** | Deer's Head | Portrays a gentle deer or a woman's face. |
| **Hamsasya** | Swan's Beak | Depicts a swan or the act of painting. |

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- A modern web browser with webcam access.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rrithvik17/Mudra-AI.git
   cd Mudra-AI
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`.

## 📂 Project Structure

- `src/hooks/useMediaPipe.js`: Core integration with MediaPipe Hands.
- `src/lib/classifier.js`: Geometric rule-based gesture classification.
- `src/lib/features.js`: Mathematical feature extraction from hand landmarks.
- `src/components/`: Modular UI components for webcam, overlays, and tutorials.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Made with ❤️ for the preservation and practice of Kuchipudi.*
