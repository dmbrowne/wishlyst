export default {
  global: {
    colors: {
      brand: "#deb536",
      brandDark: "#D39F03",
      "accent-1": "#7D4CDB",
      "status-warning": "#a96a07",
      "status-warning-bg": "#f5debb",
      "status-ok-bg": "#d5e4d0",
      "status-critical": "#a92212",
      "status-critical-bg": "#f8d7da",
      "status-info": "#006996",
      "status-info-bg": "#cce5ff",
    },
    font: {
      family: "'Poppins', Arial, sans-serif",
    },
  },
  button: {
    extend: ["\n      ", "font-family: 'HPSimplified'", "\n    "],
    border: { radius: "6px" },
    size: {
      small: {
        border: { radius: "4px" },
      },
    },
  },
  checkbox: {
    toggle: {
      radius: "24px",
      size: "48px",
      knob: {},
    },
  },
  tab: {
    border: {
      color: {
        dark: "transparent",
        light: "transparent",
      },
    },
  },
};
