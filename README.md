# Detective Conan PH: Anime and Manga - Tally Scoring System

A sophisticated web-based scoring system designed for the Detective Conan Philippines community, featuring a modern dark theme interface with smooth scroll animations and comprehensive tally management capabilities.

## 🎯 Features

### Core Functionality
- **Interactive Tally System**: Real-time scoring with customizable point distributions
- **Question Navigation**: Previous/Next question functionality with retroactive scoring
- **Flexible Scoring Modes**: 
  - Original Mode: Traditional 4-2-2-1 performance-based scoring
  - Modified Mode: Optional questions where all participants receive full points
- **Topic Persistence**: Topic fields remain consistent across all questions[3]

### User Interface
- **Dark Theme Design**: Sophisticated dark gray (#1A1A1A) background with optimal contrast ratios[4]
- **Scroll Animations**: Smooth fade-in, slide-in, scale-in, and staggered animations
- **Responsive Design**: Mobile-optimized layouts with proper spacing and accessibility
- **Character Carousel**: Auto-scrolling Detective Conan character showcase

### Advanced Features
- **Zero Filtering**: Clean copy output that excludes missed questions (removes zeros from score breakdowns)
- **Enhanced Whitespace**: Generous spacing implementation for better readability
- **Performance Optimizations**: Hardware acceleration and reduced motion support for accessibility
- **Community Integration**: Social media links and community engagement features

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Basic understanding of HTML/CSS/JavaScript for customization[1]

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Leap0920/Tally-DCPH.git
   cd detective-conan-ph-tally
   ```

2. **Open the project**
   ```bash
   # Simply open index.html in your browser
   open index.html
   ```

3. **Access the Tally System**
   - Navigate to `Tally.html` for the scoring interface
   - Configure scoring settings through the settings modal

## 📁 Project Structure

```
detective-conan-ph-tally/
├── index.html              # Main landing page
├── Tally.html             # Tally scoring system
├── styles.css             # Main stylesheet with dark theme
├── Tally.js               # Scoring system JavaScript
├── index.js               # Landing page animations
├── images/                # Character images and assets
│   ├── conan.jpg
│   ├── shinichi.jpg
│   └── ...
└── README.md              # This file
```

## 🎮 Usage

### Basic Scoring
1. **Add Participants**: Enter participant names in the input field
2. **Set Topic**: Enter the quiz topic (persists across all questions)
3. **Record Scores**: Click participant buttons to record their performance
4. **Navigate Questions**: Use Previous/Next buttons to move between questions
5. **Copy Results**: Use the copy button to export formatted results

### Scoring Configuration
Access the settings modal to configure:
- **First Question Mode**: Choose between original (4-2-2-1) or modified (4 points for all)
- **Last Question Mode**: Same options as first question
- **Middle Questions**: Customize point distribution (default: 4-2-2-1)
- **Total Questions**: Set quiz length or use unlimited mode

### Advanced Features
- **Retroactive Scoring**: Go back to previous questions to add missed scores
- **Undo Functionality**: Reverse the last scoring action per question
- **Clean Export**: Copy function automatically filters out zeros for cleaner output

## 🎨 Customization

### Theme Modifications
The dark theme uses CSS custom properties for easy customization:

```css
:root {
    --primary-color: #3b82f6;
    --accent-color: #FF9500;
    --bg-color: #1A1A1A;
    --text-color: #E0E0E0;
    --card-bg: #212121;
}
```

## 📱 Browser Support

- **Chrome**: 90+ (recommended)
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 🎯 Community

Connect with the Detective Conan PH community:
- **Facebook Group**: [Detective Conan PH: Anime and Manga](https://www.facebook.com/groups/dcphanimeandmanga)
- **Instagram**: [@conanph0304](https://www.instagram.com/conanph0304/)
- **Twitter/X**: [@conanph0304](https://x.com/conanph0304)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Detective Conan PH Community**: For inspiration and feedback
- **Bootstrap**: For responsive design framework
- **Google Fonts**: For typography (Inter and Crimson Text)
- **Bootstrap Icons**: For iconography

## 🐛 Known Issues

- Character images may not load if files are missing from the images directory
- Some animations may not work on older browsers
- Mobile landscape mode may require scrolling for full visibility

---

**Made with ❤️ for the Detective Conan Philippines community**
