/**
 * GENERATED FILE — DO NOT EDIT.
 *
 * Source:    Figma "Genus Design System" Hp8Qa76b0R6DTuFwYrnLWE
 *            02 Foundations — Color (node 19:51)
 * Extracted: 2026-08-17
 * Generator: scripts/build-tokens.mjs  (npm run tokens)
 *
 * Colour and type are Figma's. Spacing, radius, motion and layout are NOT — see
 * the nonFigma.$provenance note in scripts/figma-tokens.json.
 */

/** Raw palette steps. Mode-independent. Prefer a semantic token over these. */
export const primitives = {
  "blue": {
    "50": "#eef6fc",
    "100": "#d5e5f6",
    "200": "#aacbed",
    "300": "#80b2df",
    "400": "#5598d0",
    "500": "#0467b2",
    "600": "#2a7fc1",
    "700": "#00517d",
    "800": "#003d5e",
    "900": "#002940",
    "950": "#001522"
  },
  "orange": {
    "50": "#fff6ef",
    "100": "#fce2cd",
    "200": "#f9c69a",
    "300": "#f6aa68",
    "400": "#f28e36",
    "500": "#ee7304",
    "600": "#d96a00",
    "700": "#ad5600",
    "800": "#824000",
    "900": "#572a00",
    "950": "#2b1200"
  },
  "neutral": {
    "50": "#f7f7f7",
    "100": "#f0f0f0",
    "200": "#e0e0e0",
    "300": "#c7c7c7",
    "400": "#a3a3a3",
    "500": "#808080",
    "600": "#616161",
    "700": "#474747",
    "800": "#333333",
    "900": "#242424",
    "950": "#141414"
  },
  "success": {
    "100": "#dff6dd",
    "500": "#107c10",
    "700": "#0b6a0b"
  },
  "warning": {
    "100": "#fff4ce",
    "500": "#f0a000",
    "700": "#8a3707"
  },
  "danger": {
    "100": "#fde7e9",
    "500": "#d13438",
    "700": "#a4262c"
  },
  "info": {
    "100": "#deecf9",
    "500": "#0078d4",
    "700": "#005ba1"
  },
  "white": "#ffffff",
  "black": "#000000"
};

/** Semantic roles, resolved to hex per mode. This is what the theme consumes. */
export const semantic = {
  light: {
  "surface/canvas": "#ffffff",
  "surface/base": "#f7f7f7",
  "surface/raised": "#ffffff",
  "surface/subtle": "#f0f0f0",
  "surface/overlay": "#ffffff",
  "text/primary": "#141414",
  "text/secondary": "#474747",
  "text/tertiary": "#616161",
  "text/disabled": "#a3a3a3",
  "text/on-brand": "#ffffff",
  "border/default": "#c7c7c7",
  "border/subtle": "#e0e0e0",
  "border/strong": "#808080",
  "action/primary/rest": "#0467b2",
  "action/primary/hover": "#2a7fc1",
  "action/primary/pressed": "#00517d",
  "action/primary/indicator": "#0467b2",
  "action/accent/rest": "#ee7304",
  "action/accent/hover": "#d96a00",
  "action/accent/pressed": "#ad5600",
  "focus/ring": "#0467b2",
  "status/success/foreground": "#0b6a0b",
  "status/success/background": "#dff6dd",
  "status/warning/foreground": "#8a3707",
  "status/warning/background": "#fff4ce",
  "status/danger/foreground": "#a4262c",
  "status/danger/background": "#fde7e9",
  "status/info/foreground": "#005ba1",
  "status/info/background": "#deecf9"
},
  dark: {
  "surface/canvas": "#141414",
  "surface/base": "#242424",
  "surface/raised": "#333333",
  "surface/subtle": "#333333",
  "surface/overlay": "#242424",
  "text/primary": "#ffffff",
  "text/secondary": "#c7c7c7",
  "text/tertiary": "#a3a3a3",
  "text/disabled": "#616161",
  "text/on-brand": "#ffffff",
  "border/default": "#474747",
  "border/subtle": "#333333",
  "border/strong": "#a3a3a3",
  "action/primary/rest": "#5598d0",
  "action/primary/hover": "#80b2df",
  "action/primary/pressed": "#aacbed",
  "action/primary/indicator": "#5598d0",
  "action/accent/rest": "#f28e36",
  "action/accent/hover": "#f6aa68",
  "action/accent/pressed": "#f9c69a",
  "focus/ring": "#80b2df",
  "status/success/foreground": "#dff6dd",
  "status/success/background": "#0b6a0b",
  "status/warning/foreground": "#fff4ce",
  "status/warning/background": "#8a3707",
  "status/danger/foreground": "#fde7e9",
  "status/danger/background": "#a4262c",
  "status/info/foreground": "#deecf9",
  "status/info/background": "#005ba1"
},
};

/** Inter ramp. 10/12/14/16/18/20/28/32/56 — sizes 24 and 40 do not exist here. */
export const type = {
  "$note": "Inter. This ramp is the authority — 10/12/14/16/18/20/28/32/56 at weights 400/500/600/700. Sizes 24 and 40 do not exist in this system; do not introduce them.",
  "fontFamily": "Inter",
  "styles": {
    "display/xl": {
      "size": 56,
      "weight": 700,
      "lineHeight": 64,
      "tracking": -1.2
    },
    "heading/2": {
      "size": 32,
      "weight": 600,
      "lineHeight": 40,
      "tracking": -0.4
    },
    "heading/3": {
      "size": 28,
      "weight": 600,
      "lineHeight": 36,
      "tracking": -0.2
    },
    "title/l": {
      "size": 20,
      "weight": 600,
      "lineHeight": 28,
      "tracking": 0
    },
    "title/m": {
      "size": 18,
      "weight": 600,
      "lineHeight": 24,
      "tracking": 0
    },
    "body/l": {
      "size": 16,
      "weight": 400,
      "lineHeight": 24,
      "tracking": 0
    },
    "body/m": {
      "size": 14,
      "weight": 400,
      "lineHeight": 20,
      "tracking": 0
    },
    "body/s": {
      "size": 12,
      "weight": 400,
      "lineHeight": 16,
      "tracking": 0
    },
    "label/l": {
      "size": 14,
      "weight": 600,
      "lineHeight": 20,
      "tracking": 0
    },
    "label/m": {
      "size": 12,
      "weight": 600,
      "lineHeight": 16,
      "tracking": 0
    },
    "label/s": {
      "size": 10,
      "weight": 500,
      "lineHeight": 12,
      "tracking": 0.2
    },
    "data/mono": {
      "size": 14,
      "weight": 400,
      "lineHeight": 20,
      "tracking": 0
    }
  }
};

/**
 * Brand-hue presets for the theme customiser. A scheme changes ONLY the
 * action/primary and focus/ring roles — neutrals, surfaces, text, borders and
 * the status ramps are identical in every scheme, so no preset can break
 * contrast or restyle a warning.
 */
export const schemes = {
  "default": {
    "label": "Default",
    "fromFigma": true,
    "swatch": "#0467b2",
    "light": {
      "rest": "#0467b2",
      "hover": "#2a7fc1",
      "pressed": "#00517d",
      "focus": "#0467b2",
      "indicator": "#0467b2",
      "onBrand": "#ffffff"
    },
    "dark": {
      "rest": "#5598d0",
      "hover": "#80b2df",
      "pressed": "#aacbed",
      "focus": "#80b2df",
      "indicator": "#80b2df",
      "onBrand": "#141414"
    }
  },
  "sunset": {
    "label": "Sunset",
    "fromFigma": true,
    "swatch": "#ee7304",
    "light": {
      "rest": "#ee7304",
      "hover": "#d96a00",
      "pressed": "#ad5600",
      "focus": "#d96a00",
      "indicator": "#d96a00",
      "onBrand": "#141414"
    },
    "dark": {
      "rest": "#f28e36",
      "hover": "#f6aa68",
      "pressed": "#f9c69a",
      "focus": "#f6aa68",
      "indicator": "#f6aa68",
      "onBrand": "#141414"
    }
  },
  "indigo": {
    "label": "Indigo",
    "fromFigma": false,
    "swatch": "#4c6ef5",
    "light": {
      "rest": "#4c6ef5",
      "hover": "#214bf3",
      "pressed": "#0c34d4",
      "focus": "#4c6ef5",
      "indicator": "#4c6ef5",
      "onBrand": "#000000"
    },
    "dark": {
      "rest": "#8199f8",
      "hover": "#b6c4fb",
      "pressed": "#ebeffe",
      "focus": "#b6c4fb",
      "indicator": "#b6c4fb",
      "onBrand": "#141414"
    }
  },
  "violet": {
    "label": "Violet",
    "fromFigma": false,
    "swatch": "#7c3aed",
    "light": {
      "rest": "#7c3aed",
      "hover": "#6115e4",
      "pressed": "#4d11b6",
      "focus": "#7c3aed",
      "indicator": "#7c3aed",
      "onBrand": "#ffffff"
    },
    "dark": {
      "rest": "#9e6df2",
      "hover": "#c0a1f6",
      "pressed": "#e3d4fb",
      "focus": "#c0a1f6",
      "indicator": "#c0a1f6",
      "onBrand": "#141414"
    }
  },
  "forest": {
    "label": "Forest",
    "fromFigma": false,
    "swatch": "#3f8f4f",
    "light": {
      "rest": "#3f8f4f",
      "hover": "#316f3d",
      "pressed": "#214c2a",
      "focus": "#3f8f4f",
      "indicator": "#3f8f4f",
      "onBrand": "#141414"
    },
    "dark": {
      "rest": "#53b366",
      "hover": "#7ac489",
      "pressed": "#a1d5ab",
      "focus": "#7ac489",
      "indicator": "#7ac489",
      "onBrand": "#141414"
    }
  },
  "periwinkle": {
    "label": "Periwinkle",
    "fromFigma": false,
    "swatch": "#6b74d6",
    "light": {
      "rest": "#6b74d6",
      "hover": "#4752cc",
      "pressed": "#313baf",
      "focus": "#6b74d6",
      "indicator": "#6b74d6",
      "onBrand": "#000000"
    },
    "dark": {
      "rest": "#979de2",
      "hover": "#c3c7ee",
      "pressed": "#eff0fb",
      "focus": "#c3c7ee",
      "indicator": "#c3c7ee",
      "onBrand": "#141414"
    }
  },
  "teal": {
    "label": "Teal",
    "fromFigma": false,
    "swatch": "#2f9e9e",
    "light": {
      "rest": "#2f9e9e",
      "hover": "#247b7b",
      "pressed": "#195353",
      "focus": "#247b7b",
      "indicator": "#247b7b",
      "onBrand": "#141414"
    },
    "dark": {
      "rest": "#3fc6c6",
      "hover": "#6ad3d3",
      "pressed": "#96e0e0",
      "focus": "#6ad3d3",
      "indicator": "#6ad3d3",
      "onBrand": "#141414"
    }
  },
  "emerald": {
    "label": "Emerald",
    "fromFigma": false,
    "swatch": "#2e9464",
    "light": {
      "rest": "#2e9464",
      "hover": "#23714c",
      "pressed": "#174a32",
      "focus": "#2e9464",
      "indicator": "#2e9464",
      "onBrand": "#141414"
    },
    "dark": {
      "rest": "#3bbf81",
      "hover": "#64cf9c",
      "pressed": "#8edcb7",
      "focus": "#64cf9c",
      "indicator": "#64cf9c",
      "onBrand": "#141414"
    }
  },
  "slate": {
    "label": "Slate",
    "fromFigma": false,
    "swatch": "#41787d",
    "light": {
      "rest": "#41787d",
      "hover": "#315b5f",
      "pressed": "#203b3d",
      "focus": "#41787d",
      "indicator": "#41787d",
      "onBrand": "#ffffff"
    },
    "dark": {
      "rest": "#549ba2",
      "hover": "#76b2b8",
      "pressed": "#9bc7cb",
      "focus": "#76b2b8",
      "indicator": "#76b2b8",
      "onBrand": "#141414"
    }
  }
};

/**
 * Compliant label colours for the fills a scheme does NOT change — the accent
 * and the four status ramps. DERIVED, not extracted: Figma's single
 * `text/on-brand` (white) is 1.9:1 on warning-500, so one shared value cannot
 * be correct for every fill. See docs/token-engine-architecture.md §0.5.
 */
export const contrastOn = {
  "light": {
    "accent": "#141414",
    "success": "#ffffff",
    "warning": "#141414",
    "danger": "#ffffff",
    "info": "#ffffff"
  },
  "dark": {
    "accent": "#141414",
    "success": "#ffffff",
    "warning": "#141414",
    "danger": "#ffffff",
    "info": "#ffffff"
  }
};

/**
 * TIER 3 — component slots, resolved per mode. `theme.component.kpiTile.padding`.
 *
 * A component reads these instead of hard-coding its own geometry and colour, so
 * a designer can retune a card in the editor without a developer opening the
 * file. Every slot aliases a lower tier; see the `components` block in
 * scripts/figma-tokens.json for the reference syntax and the tier rule.
 */
export const components = {
  "light": {
    "kpiTile": {
      "background": "#ffffff",
      "border": "#e0e0e0",
      "radius": 8,
      "padding": 16,
      "gap": 8,
      "minHeight": 160,
      "labelColor": "#474747",
      "labelType": {
        "size": 12,
        "weight": 600,
        "lineHeight": 16,
        "tracking": 0
      },
      "valueColor": "#141414",
      "valueType": {
        "size": 20,
        "weight": 600,
        "lineHeight": 28,
        "tracking": 0
      },
      "unsetColor": "#616161",
      "iconSize": 28,
      "iconRadius": 8,
      "iconGlyph": 20
    },
    "panel": {
      "background": "#ffffff",
      "border": "#e0e0e0",
      "radius": 8,
      "headerPadding": 16,
      "bodyPadding": 16,
      "titleColor": "#141414",
      "titleType": {
        "size": 18,
        "weight": 600,
        "lineHeight": 24,
        "tracking": 0
      },
      "noteColor": "#474747",
      "noteType": {
        "size": 12,
        "weight": 400,
        "lineHeight": 16,
        "tracking": 0
      }
    },
    "button": {
      "radius": 4,
      "minHeight": 32,
      "minHeightSmall": 28,
      "paddingInline": 12,
      "labelType": {
        "size": 14,
        "weight": 600,
        "lineHeight": 20,
        "tracking": 0
      },
      "labelTypeSmall": {
        "size": 12,
        "weight": 600,
        "lineHeight": 16,
        "tracking": 0
      },
      "borderWidth": 1,
      "gap": 4,
      "variants": {
        "contained": {
          "label": "Contained · primary",
          "states": {
            "rest": {
              "bg": "#0467b2",
              "fg": "#ffffff",
              "border": "transparent"
            },
            "hover": {
              "bg": "#2a7fc1",
              "fg": "#ffffff",
              "border": "transparent"
            },
            "pressed": {
              "bg": "#00517d",
              "fg": "#ffffff",
              "border": "transparent"
            },
            "focus": {
              "bg": "#0467b2",
              "fg": "#ffffff",
              "border": "transparent",
              "ring": "#0467b2"
            },
            "disabled": {
              "bg": "#f0f0f0",
              "fg": "#a3a3a3",
              "border": "transparent"
            }
          }
        },
        "containedSecondary": {
          "label": "Contained · accent",
          "states": {
            "rest": {
              "bg": "#ee7304",
              "fg": "#141414",
              "border": "transparent"
            },
            "hover": {
              "bg": "#d96a00",
              "fg": "#141414",
              "border": "transparent"
            },
            "pressed": {
              "bg": "#ad5600",
              "fg": "#141414",
              "border": "transparent"
            },
            "focus": {
              "bg": "#ee7304",
              "fg": "#141414",
              "border": "transparent",
              "ring": "#0467b2"
            },
            "disabled": {
              "bg": "#f0f0f0",
              "fg": "#a3a3a3",
              "border": "transparent"
            }
          }
        },
        "outlined": {
          "label": "Outlined",
          "states": {
            "rest": {
              "bg": "#ffffff",
              "fg": "#0467b2",
              "border": "#808080"
            },
            "hover": {
              "bg": "#f0f6fa",
              "fg": "#0467b2",
              "border": "#0467b2"
            },
            "pressed": {
              "bg": "#e1edf6",
              "fg": "#00517d",
              "border": "#00517d"
            },
            "focus": {
              "bg": "#ffffff",
              "fg": "#0467b2",
              "border": "#0467b2",
              "ring": "#0467b2"
            },
            "disabled": {
              "bg": "#ffffff",
              "fg": "#a3a3a3",
              "border": "#e0e0e0"
            }
          }
        },
        "text": {
          "label": "Text · ghost",
          "states": {
            "rest": {
              "bg": "transparent",
              "fg": "#0467b2",
              "border": "transparent"
            },
            "hover": {
              "bg": "#f0f6fa",
              "fg": "#0467b2",
              "border": "transparent"
            },
            "pressed": {
              "bg": "#e1edf6",
              "fg": "#00517d",
              "border": "transparent"
            },
            "focus": {
              "bg": "transparent",
              "fg": "#0467b2",
              "border": "transparent",
              "ring": "#0467b2"
            },
            "disabled": {
              "bg": "transparent",
              "fg": "#a3a3a3",
              "border": "transparent"
            }
          }
        },
        "danger": {
          "label": "Danger",
          "states": {
            "rest": {
              "bg": "#fde7e9",
              "fg": "#a4262c",
              "border": "#a4262c"
            },
            "hover": {
              "bg": "#f4e5e6",
              "fg": "#a4262c",
              "border": "#a4262c"
            },
            "pressed": {
              "bg": "#edd4d5",
              "fg": "#a4262c",
              "border": "#a4262c"
            },
            "focus": {
              "bg": "#fde7e9",
              "fg": "#a4262c",
              "border": "#a4262c",
              "ring": "#0467b2"
            },
            "disabled": {
              "bg": "#f0f0f0",
              "fg": "#a3a3a3",
              "border": "#e0e0e0"
            }
          }
        }
      }
    },
    "input": {
      "radius": 4,
      "minHeight": 32,
      "paddingInline": 12,
      "paddingBlock": 8,
      "valueType": {
        "size": 14,
        "weight": 400,
        "lineHeight": 20,
        "tracking": 0
      },
      "labelType": {
        "size": 14,
        "weight": 400,
        "lineHeight": 20,
        "tracking": 0
      },
      "borderWidth": 1,
      "borderWidthActive": 2,
      "variants": {
        "outlined": {
          "label": "Outlined",
          "states": {
            "rest": {
              "bg": "#ffffff",
              "fg": "#141414",
              "border": "#808080"
            },
            "hover": {
              "bg": "#ffffff",
              "fg": "#141414",
              "border": "#808080"
            },
            "focus": {
              "bg": "#ffffff",
              "fg": "#141414",
              "border": "#0467b2",
              "ring": "#0467b2"
            },
            "error": {
              "bg": "#ffffff",
              "fg": "#141414",
              "border": "#a4262c"
            },
            "disabled": {
              "bg": "#f0f0f0",
              "fg": "#a3a3a3",
              "border": "#e0e0e0"
            }
          }
        }
      }
    },
    "navItem": {
      "radius": 4,
      "minHeight": 38,
      "paddingInline": 8,
      "labelType": {
        "size": 14,
        "weight": 400,
        "lineHeight": 20,
        "tracking": 0
      },
      "labelTypeActive": {
        "size": 14,
        "weight": 600,
        "lineHeight": 20,
        "tracking": 0
      },
      "iconSize": 20,
      "variants": {
        "rail": {
          "label": "Rail",
          "states": {
            "rest": {
              "bg": "transparent",
              "fg": "#474747",
              "border": "transparent"
            },
            "hover": {
              "bg": "#f1f1f1",
              "fg": "#141414",
              "border": "transparent"
            },
            "active": {
              "bg": "#e8f1f8",
              "fg": "#0467b2",
              "border": "transparent"
            },
            "focus": {
              "bg": "transparent",
              "fg": "#474747",
              "border": "transparent",
              "ring": "#0467b2"
            }
          }
        },
        "child": {
          "label": "Child row",
          "states": {
            "rest": {
              "bg": "transparent",
              "fg": "#474747",
              "border": "transparent"
            },
            "active": {
              "bg": "#edf4fa",
              "fg": "#0467b2",
              "border": "transparent"
            }
          }
        }
      }
    },
    "tableRow": {
      "rowCondensed": 40,
      "rowRegular": 48,
      "rowRelaxed": 56,
      "cellPaddingInline": 12,
      "cellType": {
        "size": 12,
        "weight": 400,
        "lineHeight": 16,
        "tracking": 0
      },
      "borderColor": "#e0e0e0",
      "variants": {
        "body": {
          "label": "Body row",
          "states": {
            "rest": {
              "bg": "#ffffff",
              "fg": "#141414",
              "border": "#e0e0e0"
            },
            "hover": {
              "bg": "#f6f6f6",
              "fg": "#141414",
              "border": "#e0e0e0"
            },
            "selected": {
              "bg": "#e8f1f8",
              "fg": "#141414",
              "border": "#e0e0e0"
            }
          }
        },
        "header": {
          "label": "Header row",
          "states": {
            "rest": {
              "bg": "#f0f0f0",
              "fg": "#616161",
              "border": "#e0e0e0"
            }
          }
        }
      }
    },
    "tab": {
      "minHeight": 40,
      "paddingInline": 12,
      "labelType": {
        "size": 14,
        "weight": 600,
        "lineHeight": 20,
        "tracking": 0
      },
      "indicatorHeight": 2,
      "indicatorColor": "#0467b2",
      "variants": {
        "underline": {
          "label": "Underline",
          "states": {
            "rest": {
              "bg": "transparent",
              "fg": "#474747",
              "border": "transparent"
            },
            "hover": {
              "bg": "#f3f3f3",
              "fg": "#141414",
              "border": "transparent"
            },
            "selected": {
              "bg": "transparent",
              "fg": "#0467b2",
              "border": "transparent"
            },
            "disabled": {
              "bg": "transparent",
              "fg": "#a3a3a3",
              "border": "transparent"
            }
          }
        }
      }
    },
    "statusChip": {
      "radius": 999,
      "height": 22,
      "heightLarge": 26,
      "paddingInline": 8,
      "labelType": {
        "size": 12,
        "weight": 600,
        "lineHeight": 16,
        "tracking": 0
      },
      "gap": 4,
      "variants": {
        "tone": {
          "label": "Tones",
          "states": {
            "neutral": {
              "bg": "#f0f0f0",
              "fg": "#474747",
              "border": "transparent"
            },
            "good": {
              "bg": "#dff6dd",
              "fg": "#0b6a0b",
              "border": "transparent"
            },
            "info": {
              "bg": "#deecf9",
              "fg": "#005ba1",
              "border": "transparent"
            },
            "warning": {
              "bg": "#fff4ce",
              "fg": "#8a3707",
              "border": "transparent"
            },
            "danger": {
              "bg": "#fde7e9",
              "fg": "#a4262c",
              "border": "transparent"
            }
          }
        }
      }
    },
    "bandChip": {
      "radius": 999,
      "height": 22,
      "paddingInline": 8,
      "labelType": {
        "size": 12,
        "weight": 600,
        "lineHeight": 16,
        "tracking": 0
      },
      "dotSize": 8,
      "variants": {
        "band": {
          "label": "Bands",
          "states": {
            "normal": {
              "bg": "transparent",
              "fg": "#141414",
              "border": "transparent"
            },
            "watch": {
              "bg": "transparent",
              "fg": "#474747",
              "border": "transparent"
            },
            "warning": {
              "bg": "#fff4ce",
              "fg": "#8a3707",
              "border": "transparent"
            },
            "critical": {
              "bg": "#fde7e9",
              "fg": "#a4262c",
              "border": "transparent"
            },
            "unknown": {
              "bg": "#f0f0f0",
              "fg": "#616161",
              "border": "transparent"
            }
          }
        }
      }
    },
    "freshnessChip": {
      "radius": 999,
      "height": 20,
      "paddingInline": 8,
      "labelType": {
        "size": 10,
        "weight": 500,
        "lineHeight": 12,
        "tracking": 0.2
      },
      "variants": {
        "age": {
          "label": "Age",
          "states": {
            "live": {
              "bg": "#dff6dd",
              "fg": "#0b6a0b",
              "border": "transparent"
            },
            "recent": {
              "bg": "#f0f0f0",
              "fg": "#474747",
              "border": "transparent"
            },
            "stale": {
              "bg": "#fff4ce",
              "fg": "#8a3707",
              "border": "transparent"
            },
            "offline": {
              "bg": "#fde7e9",
              "fg": "#a4262c",
              "border": "transparent"
            }
          }
        }
      }
    },
    "dialog": {
      "background": "#ffffff",
      "radius": 8,
      "padding": 20,
      "titleType": {
        "size": 20,
        "weight": 600,
        "lineHeight": 28,
        "tracking": 0
      },
      "titleColor": "#141414",
      "bodyType": {
        "size": 14,
        "weight": 400,
        "lineHeight": 20,
        "tracking": 0
      },
      "bodyColor": "#474747",
      "scrimOpacity": 50
    },
    "tooltip": {
      "background": "#141414",
      "foreground": "#ffffff",
      "radius": 4,
      "paddingInline": 8,
      "paddingBlock": 4,
      "labelType": {
        "size": 12,
        "weight": 400,
        "lineHeight": 16,
        "tracking": 0
      }
    },
    "menu": {
      "background": "#ffffff",
      "radius": 8,
      "borderColor": "#e0e0e0",
      "paddingBlock": 4,
      "itemType": {
        "size": 14,
        "weight": 400,
        "lineHeight": 20,
        "tracking": 0
      },
      "itemMinHeight": 32,
      "itemPaddingInline": 12,
      "variants": {
        "item": {
          "label": "Item",
          "states": {
            "rest": {
              "bg": "#ffffff",
              "fg": "#141414"
            },
            "hover": {
              "bg": "#f1f1f1",
              "fg": "#141414"
            },
            "focus": {
              "bg": "#ffffff",
              "fg": "#141414",
              "ring": "#0467b2"
            },
            "disabled": {
              "bg": "#ffffff",
              "fg": "#a3a3a3"
            }
          }
        }
      }
    },
    "drawer": {
      "background": "#ffffff",
      "border": "#e0e0e0",
      "width": 280,
      "miniWidth": 76,
      "padding": 8
    },
    "pageHeader": {
      "titleType": {
        "size": 28,
        "weight": 600,
        "lineHeight": 36,
        "tracking": -0.2
      },
      "titleColor": "#141414",
      "subtitleType": {
        "size": 16,
        "weight": 400,
        "lineHeight": 24,
        "tracking": 0
      },
      "subtitleColor": "#474747",
      "crumbType": {
        "size": 12,
        "weight": 400,
        "lineHeight": 16,
        "tracking": 0
      },
      "crumbColor": "#616161",
      "gap": 8
    },
    "emptyState": {
      "minHeight": 180,
      "padding": 20,
      "gap": 8,
      "titleType": {
        "size": 18,
        "weight": 600,
        "lineHeight": 24,
        "tracking": 0
      },
      "titleColor": "#141414",
      "bodyType": {
        "size": 14,
        "weight": 400,
        "lineHeight": 20,
        "tracking": 0
      },
      "bodyColor": "#474747",
      "iconSize": 28
    },
    "codeValue": {
      "background": "#f0f0f0",
      "radius": 4,
      "paddingInline": 4,
      "valueType": {
        "size": 14,
        "weight": 400,
        "lineHeight": 20,
        "tracking": 0
      },
      "valueColor": "#141414",
      "rawColor": "#616161"
    },
    "alert": {
      "radius": 8,
      "paddingInline": 16,
      "paddingBlock": 12,
      "borderWidth": 1,
      "labelType": {
        "size": 14,
        "weight": 400,
        "lineHeight": 20,
        "tracking": 0
      },
      "gap": 8,
      "variants": {
        "tone": {
          "label": "Severities",
          "states": {
            "good": {
              "bg": "#dff6dd",
              "fg": "#0b6a0b",
              "border": "#0b6a0b"
            },
            "info": {
              "bg": "#deecf9",
              "fg": "#005ba1",
              "border": "#005ba1"
            },
            "warning": {
              "bg": "#fff4ce",
              "fg": "#8a3707",
              "border": "#8a3707"
            },
            "danger": {
              "bg": "#fde7e9",
              "fg": "#a4262c",
              "border": "#a4262c"
            }
          }
        }
      }
    },
    "checkbox": {
      "size": 18,
      "radius": 2,
      "borderWidth": 1.5,
      "variants": {
        "box": {
          "label": "Box",
          "states": {
            "rest": {
              "bg": "#ffffff",
              "border": "#808080"
            },
            "hover": {
              "bg": "#f0f6fa",
              "border": "#0467b2"
            },
            "selected": {
              "bg": "#0467b2",
              "fg": "#ffffff"
            },
            "focus": {
              "bg": "#ffffff",
              "border": "#0467b2",
              "ring": "#0467b2"
            },
            "disabled": {
              "bg": "#f0f0f0",
              "fg": "#a3a3a3",
              "border": "#c7c7c7"
            }
          }
        }
      }
    }
  },
  "dark": {
    "kpiTile": {
      "background": "#333333",
      "border": "#474747",
      "radius": 8,
      "padding": 16,
      "gap": 8,
      "minHeight": 160,
      "labelColor": "#c7c7c7",
      "labelType": {
        "size": 12,
        "weight": 600,
        "lineHeight": 16,
        "tracking": 0
      },
      "valueColor": "#ffffff",
      "valueType": {
        "size": 20,
        "weight": 600,
        "lineHeight": 28,
        "tracking": 0
      },
      "unsetColor": "#a3a3a3",
      "iconSize": 28,
      "iconRadius": 8,
      "iconGlyph": 20
    },
    "panel": {
      "background": "#333333",
      "border": "#474747",
      "radius": 8,
      "headerPadding": 16,
      "bodyPadding": 16,
      "titleColor": "#ffffff",
      "titleType": {
        "size": 18,
        "weight": 600,
        "lineHeight": 24,
        "tracking": 0
      },
      "noteColor": "#c7c7c7",
      "noteType": {
        "size": 12,
        "weight": 400,
        "lineHeight": 16,
        "tracking": 0
      }
    },
    "button": {
      "radius": 4,
      "minHeight": 32,
      "minHeightSmall": 28,
      "paddingInline": 12,
      "labelType": {
        "size": 14,
        "weight": 600,
        "lineHeight": 20,
        "tracking": 0
      },
      "labelTypeSmall": {
        "size": 12,
        "weight": 600,
        "lineHeight": 16,
        "tracking": 0
      },
      "borderWidth": 1,
      "gap": 4,
      "variants": {
        "contained": {
          "label": "Contained · primary",
          "states": {
            "rest": {
              "bg": "#5598d0",
              "fg": "#141414",
              "border": "transparent"
            },
            "hover": {
              "bg": "#80b2df",
              "fg": "#141414",
              "border": "transparent"
            },
            "pressed": {
              "bg": "#aacbed",
              "fg": "#141414",
              "border": "transparent"
            },
            "focus": {
              "bg": "#5598d0",
              "fg": "#141414",
              "border": "transparent",
              "ring": "#80b2df"
            },
            "disabled": {
              "bg": "#333333",
              "fg": "#616161",
              "border": "transparent"
            }
          }
        },
        "containedSecondary": {
          "label": "Contained · accent",
          "states": {
            "rest": {
              "bg": "#f28e36",
              "fg": "#141414",
              "border": "transparent"
            },
            "hover": {
              "bg": "#f6aa68",
              "fg": "#141414",
              "border": "transparent"
            },
            "pressed": {
              "bg": "#f9c69a",
              "fg": "#141414",
              "border": "transparent"
            },
            "focus": {
              "bg": "#f28e36",
              "fg": "#141414",
              "border": "transparent",
              "ring": "#80b2df"
            },
            "disabled": {
              "bg": "#333333",
              "fg": "#616161",
              "border": "transparent"
            }
          }
        },
        "outlined": {
          "label": "Outlined",
          "states": {
            "rest": {
              "bg": "#333333",
              "fg": "#5598d0",
              "border": "#a3a3a3"
            },
            "hover": {
              "bg": "#35393c",
              "fg": "#5598d0",
              "border": "#5598d0"
            },
            "pressed": {
              "bg": "#373f46",
              "fg": "#aacbed",
              "border": "#aacbed"
            },
            "focus": {
              "bg": "#333333",
              "fg": "#5598d0",
              "border": "#5598d0",
              "ring": "#80b2df"
            },
            "disabled": {
              "bg": "#333333",
              "fg": "#616161",
              "border": "#333333"
            }
          }
        },
        "text": {
          "label": "Text · ghost",
          "states": {
            "rest": {
              "bg": "transparent",
              "fg": "#5598d0",
              "border": "transparent"
            },
            "hover": {
              "bg": "#35393c",
              "fg": "#5598d0",
              "border": "transparent"
            },
            "pressed": {
              "bg": "#373f46",
              "fg": "#aacbed",
              "border": "transparent"
            },
            "focus": {
              "bg": "transparent",
              "fg": "#5598d0",
              "border": "transparent",
              "ring": "#80b2df"
            },
            "disabled": {
              "bg": "transparent",
              "fg": "#616161",
              "border": "transparent"
            }
          }
        },
        "danger": {
          "label": "Danger",
          "states": {
            "rest": {
              "bg": "#a4262c",
              "fg": "#fde7e9",
              "border": "#fde7e9"
            },
            "hover": {
              "bg": "#4b4949",
              "fg": "#fde7e9",
              "border": "#fde7e9"
            },
            "pressed": {
              "bg": "#5b5757",
              "fg": "#fde7e9",
              "border": "#fde7e9"
            },
            "focus": {
              "bg": "#a4262c",
              "fg": "#fde7e9",
              "border": "#fde7e9",
              "ring": "#80b2df"
            },
            "disabled": {
              "bg": "#333333",
              "fg": "#616161",
              "border": "#333333"
            }
          }
        }
      }
    },
    "input": {
      "radius": 4,
      "minHeight": 32,
      "paddingInline": 12,
      "paddingBlock": 8,
      "valueType": {
        "size": 14,
        "weight": 400,
        "lineHeight": 20,
        "tracking": 0
      },
      "labelType": {
        "size": 14,
        "weight": 400,
        "lineHeight": 20,
        "tracking": 0
      },
      "borderWidth": 1,
      "borderWidthActive": 2,
      "variants": {
        "outlined": {
          "label": "Outlined",
          "states": {
            "rest": {
              "bg": "#333333",
              "fg": "#ffffff",
              "border": "#a3a3a3"
            },
            "hover": {
              "bg": "#333333",
              "fg": "#ffffff",
              "border": "#a3a3a3"
            },
            "focus": {
              "bg": "#333333",
              "fg": "#ffffff",
              "border": "#80b2df",
              "ring": "#80b2df"
            },
            "error": {
              "bg": "#333333",
              "fg": "#ffffff",
              "border": "#fde7e9"
            },
            "disabled": {
              "bg": "#333333",
              "fg": "#616161",
              "border": "#333333"
            }
          }
        }
      }
    },
    "navItem": {
      "radius": 4,
      "minHeight": 38,
      "paddingInline": 8,
      "labelType": {
        "size": 14,
        "weight": 400,
        "lineHeight": 20,
        "tracking": 0
      },
      "labelTypeActive": {
        "size": 14,
        "weight": 600,
        "lineHeight": 20,
        "tracking": 0
      },
      "iconSize": 20,
      "variants": {
        "rail": {
          "label": "Rail",
          "states": {
            "rest": {
              "bg": "transparent",
              "fg": "#c7c7c7",
              "border": "transparent"
            },
            "hover": {
              "bg": "#3f3f3f",
              "fg": "#ffffff",
              "border": "transparent"
            },
            "active": {
              "bg": "#363c41",
              "fg": "#5598d0",
              "border": "transparent"
            },
            "focus": {
              "bg": "transparent",
              "fg": "#c7c7c7",
              "border": "transparent",
              "ring": "#80b2df"
            }
          }
        },
        "child": {
          "label": "Child row",
          "states": {
            "rest": {
              "bg": "transparent",
              "fg": "#c7c7c7",
              "border": "transparent"
            },
            "active": {
              "bg": "#353a3e",
              "fg": "#5598d0",
              "border": "transparent"
            }
          }
        }
      }
    },
    "tableRow": {
      "rowCondensed": 40,
      "rowRegular": 48,
      "rowRelaxed": 56,
      "cellPaddingInline": 12,
      "cellType": {
        "size": 12,
        "weight": 400,
        "lineHeight": 16,
        "tracking": 0
      },
      "borderColor": "#333333",
      "variants": {
        "body": {
          "label": "Body row",
          "states": {
            "rest": {
              "bg": "#333333",
              "fg": "#ffffff",
              "border": "#333333"
            },
            "hover": {
              "bg": "#3b3b3b",
              "fg": "#ffffff",
              "border": "#333333"
            },
            "selected": {
              "bg": "#363c41",
              "fg": "#ffffff",
              "border": "#333333"
            }
          }
        },
        "header": {
          "label": "Header row",
          "states": {
            "rest": {
              "bg": "#333333",
              "fg": "#a3a3a3",
              "border": "#333333"
            }
          }
        }
      }
    },
    "tab": {
      "minHeight": 40,
      "paddingInline": 12,
      "labelType": {
        "size": 14,
        "weight": 600,
        "lineHeight": 20,
        "tracking": 0
      },
      "indicatorHeight": 2,
      "indicatorColor": "#5598d0",
      "variants": {
        "underline": {
          "label": "Underline",
          "states": {
            "rest": {
              "bg": "transparent",
              "fg": "#c7c7c7",
              "border": "transparent"
            },
            "hover": {
              "bg": "#3d3d3d",
              "fg": "#ffffff",
              "border": "transparent"
            },
            "selected": {
              "bg": "transparent",
              "fg": "#5598d0",
              "border": "transparent"
            },
            "disabled": {
              "bg": "transparent",
              "fg": "#616161",
              "border": "transparent"
            }
          }
        }
      }
    },
    "statusChip": {
      "radius": 999,
      "height": 22,
      "heightLarge": 26,
      "paddingInline": 8,
      "labelType": {
        "size": 12,
        "weight": 600,
        "lineHeight": 16,
        "tracking": 0
      },
      "gap": 4,
      "variants": {
        "tone": {
          "label": "Tones",
          "states": {
            "neutral": {
              "bg": "#333333",
              "fg": "#c7c7c7",
              "border": "transparent"
            },
            "good": {
              "bg": "#0b6a0b",
              "fg": "#dff6dd",
              "border": "transparent"
            },
            "info": {
              "bg": "#005ba1",
              "fg": "#deecf9",
              "border": "transparent"
            },
            "warning": {
              "bg": "#8a3707",
              "fg": "#fff4ce",
              "border": "transparent"
            },
            "danger": {
              "bg": "#a4262c",
              "fg": "#fde7e9",
              "border": "transparent"
            }
          }
        }
      }
    },
    "bandChip": {
      "radius": 999,
      "height": 22,
      "paddingInline": 8,
      "labelType": {
        "size": 12,
        "weight": 600,
        "lineHeight": 16,
        "tracking": 0
      },
      "dotSize": 8,
      "variants": {
        "band": {
          "label": "Bands",
          "states": {
            "normal": {
              "bg": "transparent",
              "fg": "#ffffff",
              "border": "transparent"
            },
            "watch": {
              "bg": "transparent",
              "fg": "#c7c7c7",
              "border": "transparent"
            },
            "warning": {
              "bg": "#8a3707",
              "fg": "#fff4ce",
              "border": "transparent"
            },
            "critical": {
              "bg": "#a4262c",
              "fg": "#fde7e9",
              "border": "transparent"
            },
            "unknown": {
              "bg": "#333333",
              "fg": "#a3a3a3",
              "border": "transparent"
            }
          }
        }
      }
    },
    "freshnessChip": {
      "radius": 999,
      "height": 20,
      "paddingInline": 8,
      "labelType": {
        "size": 10,
        "weight": 500,
        "lineHeight": 12,
        "tracking": 0.2
      },
      "variants": {
        "age": {
          "label": "Age",
          "states": {
            "live": {
              "bg": "#0b6a0b",
              "fg": "#dff6dd",
              "border": "transparent"
            },
            "recent": {
              "bg": "#333333",
              "fg": "#c7c7c7",
              "border": "transparent"
            },
            "stale": {
              "bg": "#8a3707",
              "fg": "#fff4ce",
              "border": "transparent"
            },
            "offline": {
              "bg": "#a4262c",
              "fg": "#fde7e9",
              "border": "transparent"
            }
          }
        }
      }
    },
    "dialog": {
      "background": "#242424",
      "radius": 8,
      "padding": 20,
      "titleType": {
        "size": 20,
        "weight": 600,
        "lineHeight": 28,
        "tracking": 0
      },
      "titleColor": "#ffffff",
      "bodyType": {
        "size": 14,
        "weight": 400,
        "lineHeight": 20,
        "tracking": 0
      },
      "bodyColor": "#c7c7c7",
      "scrimOpacity": 50
    },
    "tooltip": {
      "background": "#ffffff",
      "foreground": "#141414",
      "radius": 4,
      "paddingInline": 8,
      "paddingBlock": 4,
      "labelType": {
        "size": 12,
        "weight": 400,
        "lineHeight": 16,
        "tracking": 0
      }
    },
    "menu": {
      "background": "#242424",
      "radius": 8,
      "borderColor": "#333333",
      "paddingBlock": 4,
      "itemType": {
        "size": 14,
        "weight": 400,
        "lineHeight": 20,
        "tracking": 0
      },
      "itemMinHeight": 32,
      "itemPaddingInline": 12,
      "variants": {
        "item": {
          "label": "Item",
          "states": {
            "rest": {
              "bg": "#242424",
              "fg": "#ffffff"
            },
            "hover": {
              "bg": "#313131",
              "fg": "#ffffff"
            },
            "focus": {
              "bg": "#242424",
              "fg": "#ffffff",
              "ring": "#80b2df"
            },
            "disabled": {
              "bg": "#242424",
              "fg": "#616161"
            }
          }
        }
      }
    },
    "drawer": {
      "background": "#333333",
      "border": "#474747",
      "width": 280,
      "miniWidth": 76,
      "padding": 8
    },
    "pageHeader": {
      "titleType": {
        "size": 28,
        "weight": 600,
        "lineHeight": 36,
        "tracking": -0.2
      },
      "titleColor": "#ffffff",
      "subtitleType": {
        "size": 16,
        "weight": 400,
        "lineHeight": 24,
        "tracking": 0
      },
      "subtitleColor": "#c7c7c7",
      "crumbType": {
        "size": 12,
        "weight": 400,
        "lineHeight": 16,
        "tracking": 0
      },
      "crumbColor": "#a3a3a3",
      "gap": 8
    },
    "emptyState": {
      "minHeight": 180,
      "padding": 20,
      "gap": 8,
      "titleType": {
        "size": 18,
        "weight": 600,
        "lineHeight": 24,
        "tracking": 0
      },
      "titleColor": "#ffffff",
      "bodyType": {
        "size": 14,
        "weight": 400,
        "lineHeight": 20,
        "tracking": 0
      },
      "bodyColor": "#c7c7c7",
      "iconSize": 28
    },
    "codeValue": {
      "background": "#333333",
      "radius": 4,
      "paddingInline": 4,
      "valueType": {
        "size": 14,
        "weight": 400,
        "lineHeight": 20,
        "tracking": 0
      },
      "valueColor": "#ffffff",
      "rawColor": "#a3a3a3"
    },
    "alert": {
      "radius": 8,
      "paddingInline": 16,
      "paddingBlock": 12,
      "borderWidth": 1,
      "labelType": {
        "size": 14,
        "weight": 400,
        "lineHeight": 20,
        "tracking": 0
      },
      "gap": 8,
      "variants": {
        "tone": {
          "label": "Severities",
          "states": {
            "good": {
              "bg": "#0b6a0b",
              "fg": "#dff6dd",
              "border": "#dff6dd"
            },
            "info": {
              "bg": "#005ba1",
              "fg": "#deecf9",
              "border": "#deecf9"
            },
            "warning": {
              "bg": "#8a3707",
              "fg": "#fff4ce",
              "border": "#fff4ce"
            },
            "danger": {
              "bg": "#a4262c",
              "fg": "#fde7e9",
              "border": "#fde7e9"
            }
          }
        }
      }
    },
    "checkbox": {
      "size": 18,
      "radius": 2,
      "borderWidth": 1.5,
      "variants": {
        "box": {
          "label": "Box",
          "states": {
            "rest": {
              "bg": "#333333",
              "border": "#a3a3a3"
            },
            "hover": {
              "bg": "#35393c",
              "border": "#5598d0"
            },
            "selected": {
              "bg": "#5598d0",
              "fg": "#333333"
            },
            "focus": {
              "bg": "#333333",
              "border": "#80b2df",
              "ring": "#80b2df"
            },
            "disabled": {
              "bg": "#333333",
              "fg": "#616161",
              "border": "#474747"
            }
          }
        }
      }
    }
  }
};

/**
 * The RAW tier-3 definitions, still holding their `{sem:…}` references.
 * `components` above is these resolved against the DEFAULT scheme; every other
 * scheme re-resolves from here via `componentsFor()`, because a slot aliasing
 * `action/primary/rest` has a different value in every scheme and baking one
 * copy pinned them all to blue.
 */
export const componentDefs = {
  "kpiTile": {
    "$label": "KPI tile",
    "$note": "The dashboard metric card. Six sit side by side, so its padding and min-height set the rhythm of every overview screen.",
    "$base": {
      "background": {
        "$value": "{sem:surface/raised}",
        "$type": "color"
      },
      "border": {
        "$value": "{sem:border/subtle}",
        "$type": "color",
        "$darkValue": "{sem:border/default}",
        "$note": "border/subtle and surface/raised are the SAME hex in dark mode — a 1.00:1 edge. Hence the dark override; see AGENTS.md §1."
      },
      "radius": {
        "$value": "{radius:surface}",
        "$type": "dimension"
      },
      "padding": {
        "$value": "{space:4}",
        "$type": "dimension"
      },
      "gap": {
        "$value": "{space:2}",
        "$type": "dimension"
      },
      "minHeight": {
        "$value": 160,
        "$type": "dimension"
      },
      "labelColor": {
        "$value": "{sem:text/secondary}",
        "$type": "color"
      },
      "labelType": {
        "$value": "{type:label/m}",
        "$type": "typography"
      },
      "valueColor": {
        "$value": "{sem:text/primary}",
        "$type": "color"
      },
      "valueType": {
        "$value": "{type:title/l}",
        "$type": "typography"
      },
      "unsetColor": {
        "$value": "{sem:text/tertiary}",
        "$type": "color",
        "$note": "A value the platform cannot state. Italic in this colour, never a plausible zero."
      },
      "iconSize": {
        "$value": 28,
        "$type": "dimension"
      },
      "iconRadius": {
        "$value": "{radius:surface}",
        "$type": "dimension"
      },
      "iconGlyph": {
        "$value": 20,
        "$type": "dimension"
      }
    },
    "$pairs": [
      {
        "fg": "labelColor",
        "bg": "background",
        "kind": "text",
        "typeToken": "label/m"
      },
      {
        "fg": "valueColor",
        "bg": "background",
        "kind": "text",
        "typeToken": "title/l"
      },
      {
        "fg": "unsetColor",
        "bg": "background",
        "kind": "text",
        "typeToken": "title/l"
      },
      {
        "fg": "border",
        "bg": "background",
        "kind": "decorative"
      }
    ]
  },
  "panel": {
    "$label": "Panel",
    "$note": "The standard bordered section. Every table and chart in the product sits in one.",
    "$base": {
      "background": {
        "$value": "{sem:surface/raised}",
        "$type": "color"
      },
      "border": {
        "$value": "{sem:border/subtle}",
        "$type": "color",
        "$darkValue": "{sem:border/default}"
      },
      "radius": {
        "$value": "{radius:surface}",
        "$type": "dimension"
      },
      "headerPadding": {
        "$value": "{space:4}",
        "$type": "dimension"
      },
      "bodyPadding": {
        "$value": "{space:4}",
        "$type": "dimension"
      },
      "titleColor": {
        "$value": "{sem:text/primary}",
        "$type": "color"
      },
      "titleType": {
        "$value": "{type:title/m}",
        "$type": "typography"
      },
      "noteColor": {
        "$value": "{sem:text/secondary}",
        "$type": "color"
      },
      "noteType": {
        "$value": "{type:body/s}",
        "$type": "typography"
      }
    },
    "$pairs": [
      {
        "fg": "titleColor",
        "bg": "background",
        "kind": "text",
        "typeToken": "title/m"
      },
      {
        "fg": "noteColor",
        "bg": "background",
        "kind": "text",
        "typeToken": "body/s"
      },
      {
        "fg": "border",
        "bg": "background",
        "kind": "decorative"
      }
    ]
  },
  "button": {
    "$label": "Button",
    "$note": "Five variants, five states each. The contained variants' label is DERIVED per fill (AGENTS.md §1a) — the `fg` slots below record what that derivation currently produces, so the audit can score them.",
    "$base": {
      "radius": {
        "$value": "{radius:control}",
        "$type": "dimension"
      },
      "minHeight": {
        "$value": 32,
        "$type": "dimension"
      },
      "minHeightSmall": {
        "$value": 28,
        "$type": "dimension"
      },
      "paddingInline": {
        "$value": "{space:3}",
        "$type": "dimension"
      },
      "labelType": {
        "$value": "{type:label/l}",
        "$type": "typography"
      },
      "labelTypeSmall": {
        "$value": "{type:label/m}",
        "$type": "typography"
      },
      "borderWidth": {
        "$value": 1,
        "$type": "dimension"
      },
      "gap": {
        "$value": "{space:1}",
        "$type": "dimension"
      }
    },
    "$variants": {
      "contained": {
        "$label": "Contained · primary",
        "$states": {
          "rest": {
            "bg": {
              "$value": "{sem:action/primary/rest}",
              "$type": "color"
            },
            "fg": {
              "$value": "{derive:onBrand}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          },
          "hover": {
            "bg": {
              "$value": "{sem:action/primary/hover}",
              "$type": "color"
            },
            "fg": {
              "$value": "{derive:onBrand}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            },
            "$knownDefect": {
              "note": "The contained label is derived from the REST fill, but hover and pressed are different fills — and in light mode the ramp spans the luminance point where the required foreground flips. One label cannot serve all three. Same root cause as §0.6; fixing it means changing the light-mode interaction ramp.",
              "owner": "design-system",
              "decision": "token-engine-architecture.md §5.3"
            }
          },
          "pressed": {
            "bg": {
              "$value": "{sem:action/primary/pressed}",
              "$type": "color"
            },
            "fg": {
              "$value": "{derive:onBrand}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            },
            "$knownDefect": {
              "note": "The contained label is derived from the REST fill, but hover and pressed are different fills — and in light mode the ramp spans the luminance point where the required foreground flips. One label cannot serve all three. Same root cause as §0.6; fixing it means changing the light-mode interaction ramp.",
              "owner": "design-system",
              "decision": "token-engine-architecture.md §5.3"
            }
          },
          "focus": {
            "bg": {
              "$value": "{sem:action/primary/rest}",
              "$type": "color"
            },
            "fg": {
              "$value": "{derive:onBrand}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            },
            "ring": {
              "$value": "{sem:focus/ring}",
              "$type": "color"
            }
          },
          "disabled": {
            "bg": {
              "$value": "{sem:surface/subtle}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/disabled}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          }
        }
      },
      "containedSecondary": {
        "$label": "Contained · accent",
        "$states": {
          "rest": {
            "bg": {
              "$value": "{sem:action/accent/rest}",
              "$type": "color"
            },
            "fg": {
              "$value": "{derive:accent}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          },
          "hover": {
            "bg": {
              "$value": "{sem:action/accent/hover}",
              "$type": "color"
            },
            "fg": {
              "$value": "{derive:accent}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            },
            "$knownDefect": {
              "note": "The contained label is derived from the REST fill, but hover and pressed are different fills — and in light mode the ramp spans the luminance point where the required foreground flips. One label cannot serve all three. Same root cause as §0.6; fixing it means changing the light-mode interaction ramp.",
              "owner": "design-system",
              "decision": "token-engine-architecture.md §5.3"
            }
          },
          "pressed": {
            "bg": {
              "$value": "{sem:action/accent/pressed}",
              "$type": "color"
            },
            "fg": {
              "$value": "{derive:accent}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            },
            "$knownDefect": {
              "note": "The contained label is derived from the REST fill, but hover and pressed are different fills — and in light mode the ramp spans the luminance point where the required foreground flips. One label cannot serve all three. Same root cause as §0.6; fixing it means changing the light-mode interaction ramp.",
              "owner": "design-system",
              "decision": "token-engine-architecture.md §5.3"
            }
          },
          "focus": {
            "bg": {
              "$value": "{sem:action/accent/rest}",
              "$type": "color"
            },
            "fg": {
              "$value": "{derive:accent}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            },
            "ring": {
              "$value": "{sem:focus/ring}",
              "$type": "color"
            }
          },
          "disabled": {
            "bg": {
              "$value": "{sem:surface/subtle}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/disabled}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          }
        }
      },
      "outlined": {
        "$label": "Outlined",
        "$states": {
          "rest": {
            "bg": {
              "$value": "{sem:surface/raised}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:action/primary/rest}",
              "$type": "color"
            },
            "border": {
              "$value": "{sem:border/strong}",
              "$type": "color"
            }
          },
          "hover": {
            "bg": {
              "$value": "{mix:action/primary/rest,surface/raised,6}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:action/primary/rest}",
              "$type": "color"
            },
            "border": {
              "$value": "{sem:action/primary/indicator}",
              "$type": "color"
            }
          },
          "pressed": {
            "bg": {
              "$value": "{mix:action/primary/rest,surface/raised,12}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:action/primary/pressed}",
              "$type": "color"
            },
            "border": {
              "$value": "{sem:action/primary/pressed}",
              "$type": "color"
            }
          },
          "focus": {
            "bg": {
              "$value": "{sem:surface/raised}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:action/primary/rest}",
              "$type": "color"
            },
            "border": {
              "$value": "{sem:action/primary/indicator}",
              "$type": "color"
            },
            "ring": {
              "$value": "{sem:focus/ring}",
              "$type": "color"
            }
          },
          "disabled": {
            "bg": {
              "$value": "{sem:surface/raised}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/disabled}",
              "$type": "color"
            },
            "border": {
              "$value": "{sem:border/subtle}",
              "$type": "color"
            }
          }
        },
        "$knownDefect": {
          "note": "THE BRAND COLOUR USED AS 14px TEXT. In dark mode action/primary/rest is ramp[400], chosen so the brand works as a FILL and as a 3:1 non-text indicator. As a label it needs 4.5:1 and delivers 4.08:1 on surface/raised — so every outlined button, text button, active nav row and selected tab label is non-compliant in dark mode, in all nine schemes. 81 instances, one cause. The fix mirrors what focus/ring already does: derive a separate brand-as-text step, the first clearing 4.5:1 against the hardest surface (blue-300 gives 5.63:1). That changes shipped colour, so it needs sign-off.",
          "owner": "design-system",
          "decision": "token-engine-architecture.md §5.6 — the fill/indicator split, now three roles: fill, indicator, text"
        }
      },
      "text": {
        "$label": "Text · ghost",
        "$states": {
          "rest": {
            "bg": {
              "$value": "transparent",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:action/primary/rest}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          },
          "hover": {
            "bg": {
              "$value": "{mix:action/primary/rest,surface/raised,6}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:action/primary/rest}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          },
          "pressed": {
            "bg": {
              "$value": "{mix:action/primary/rest,surface/raised,12}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:action/primary/pressed}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          },
          "focus": {
            "bg": {
              "$value": "transparent",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:action/primary/rest}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            },
            "ring": {
              "$value": "{sem:focus/ring}",
              "$type": "color"
            }
          },
          "disabled": {
            "bg": {
              "$value": "transparent",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/disabled}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          }
        },
        "$knownDefect": {
          "note": "THE BRAND COLOUR USED AS 14px TEXT. In dark mode action/primary/rest is ramp[400], chosen so the brand works as a FILL and as a 3:1 non-text indicator. As a label it needs 4.5:1 and delivers 4.08:1 on surface/raised — so every outlined button, text button, active nav row and selected tab label is non-compliant in dark mode, in all nine schemes. 81 instances, one cause. The fix mirrors what focus/ring already does: derive a separate brand-as-text step, the first clearing 4.5:1 against the hardest surface (blue-300 gives 5.63:1). That changes shipped colour, so it needs sign-off.",
          "owner": "design-system",
          "decision": "token-engine-architecture.md §5.6 — the fill/indicator split, now three roles: fill, indicator, text"
        }
      },
      "danger": {
        "$label": "Danger",
        "$states": {
          "rest": {
            "bg": {
              "$value": "{sem:status/danger/background}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:status/danger/foreground}",
              "$type": "color"
            },
            "border": {
              "$value": "{sem:status/danger/foreground}",
              "$type": "color"
            }
          },
          "hover": {
            "bg": {
              "$value": "{mix:status/danger/foreground,surface/raised,12}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:status/danger/foreground}",
              "$type": "color"
            },
            "border": {
              "$value": "{sem:status/danger/foreground}",
              "$type": "color"
            }
          },
          "pressed": {
            "bg": {
              "$value": "{mix:status/danger/foreground,surface/raised,20}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:status/danger/foreground}",
              "$type": "color"
            },
            "border": {
              "$value": "{sem:status/danger/foreground}",
              "$type": "color"
            }
          },
          "focus": {
            "bg": {
              "$value": "{sem:status/danger/background}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:status/danger/foreground}",
              "$type": "color"
            },
            "border": {
              "$value": "{sem:status/danger/foreground}",
              "$type": "color"
            },
            "ring": {
              "$value": "{sem:focus/ring}",
              "$type": "color"
            }
          },
          "disabled": {
            "bg": {
              "$value": "{sem:surface/subtle}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/disabled}",
              "$type": "color"
            },
            "border": {
              "$value": "{sem:border/subtle}",
              "$type": "color"
            }
          }
        }
      }
    },
    "$borderRole": "control",
    "$borderNote": "An outlined button's edge is the only thing identifying it — SC 1.4.11 applies. Uses border/strong, not border/default: default is 1.69:1 against the fill and cannot be seen."
  },
  "input": {
    "$label": "Input",
    "$note": "Outlined text field. Five states, and `error` is a state rather than a variant because it is transient.",
    "$base": {
      "radius": {
        "$value": "{radius:control}",
        "$type": "dimension"
      },
      "minHeight": {
        "$value": 32,
        "$type": "dimension"
      },
      "paddingInline": {
        "$value": "{space:3}",
        "$type": "dimension"
      },
      "paddingBlock": {
        "$value": "{space:2}",
        "$type": "dimension"
      },
      "valueType": {
        "$value": "{type:body/m}",
        "$type": "typography"
      },
      "labelType": {
        "$value": "{type:body/m}",
        "$type": "typography"
      },
      "borderWidth": {
        "$value": 1,
        "$type": "dimension"
      },
      "borderWidthActive": {
        "$value": 2,
        "$type": "dimension"
      }
    },
    "$variants": {
      "outlined": {
        "$label": "Outlined",
        "$states": {
          "rest": {
            "bg": {
              "$value": "{sem:surface/raised}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/primary}",
              "$type": "color"
            },
            "border": {
              "$value": "{sem:border/strong}",
              "$type": "color"
            }
          },
          "hover": {
            "bg": {
              "$value": "{sem:surface/raised}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/primary}",
              "$type": "color"
            },
            "border": {
              "$value": "{sem:border/strong}",
              "$type": "color"
            }
          },
          "focus": {
            "bg": {
              "$value": "{sem:surface/raised}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/primary}",
              "$type": "color"
            },
            "border": {
              "$value": "{sem:focus/ring}",
              "$type": "color"
            },
            "ring": {
              "$value": "{sem:focus/ring}",
              "$type": "color"
            }
          },
          "error": {
            "bg": {
              "$value": "{sem:surface/raised}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/primary}",
              "$type": "color"
            },
            "border": {
              "$value": "{sem:status/danger/foreground}",
              "$type": "color"
            }
          },
          "disabled": {
            "bg": {
              "$value": "{sem:surface/subtle}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/disabled}",
              "$type": "color"
            },
            "border": {
              "$value": "{sem:border/subtle}",
              "$type": "color"
            }
          }
        }
      }
    },
    "$borderRole": "control",
    "$borderNote": "A field's boundary is what says 'you may type here'. SC 1.4.11 applies. Uses border/strong for the same reason."
  },
  "navItem": {
    "$label": "Nav item",
    "$note": "Sidebar row. `active` uses a brand tint over the rail surface — declared as a mix so its contrast is judgeable.",
    "$base": {
      "radius": {
        "$value": "{radius:control}",
        "$type": "dimension"
      },
      "minHeight": {
        "$value": 38,
        "$type": "dimension"
      },
      "paddingInline": {
        "$value": "{space:2}",
        "$type": "dimension"
      },
      "labelType": {
        "$value": "{type:body/m}",
        "$type": "typography"
      },
      "labelTypeActive": {
        "$value": "{type:label/l}",
        "$type": "typography"
      },
      "iconSize": {
        "$value": 20,
        "$type": "dimension"
      }
    },
    "$variants": {
      "rail": {
        "$label": "Rail",
        "$states": {
          "rest": {
            "bg": {
              "$value": "transparent",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/secondary}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          },
          "hover": {
            "bg": {
              "$value": "{mix:text/primary,surface/raised,6}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/primary}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          },
          "active": {
            "bg": {
              "$value": "{mix:action/primary/rest,surface/raised,9}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:action/primary/rest}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          },
          "focus": {
            "bg": {
              "$value": "transparent",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/secondary}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            },
            "ring": {
              "$value": "{sem:focus/ring}",
              "$type": "color"
            }
          }
        },
        "$knownDefect": {
          "note": "THE BRAND COLOUR USED AS 14px TEXT. In dark mode action/primary/rest is ramp[400], chosen so the brand works as a FILL and as a 3:1 non-text indicator. As a label it needs 4.5:1 and delivers 4.08:1 on surface/raised — so every outlined button, text button, active nav row and selected tab label is non-compliant in dark mode, in all nine schemes. 81 instances, one cause. The fix mirrors what focus/ring already does: derive a separate brand-as-text step, the first clearing 4.5:1 against the hardest surface (blue-300 gives 5.63:1). That changes shipped colour, so it needs sign-off.",
          "owner": "design-system",
          "decision": "token-engine-architecture.md §5.6 — the fill/indicator split, now three roles: fill, indicator, text"
        }
      },
      "child": {
        "$label": "Child row",
        "$states": {
          "rest": {
            "bg": {
              "$value": "transparent",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/secondary}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          },
          "active": {
            "bg": {
              "$value": "{mix:action/primary/rest,surface/raised,7}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:action/primary/rest}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          }
        },
        "$knownDefect": {
          "note": "THE BRAND COLOUR USED AS 14px TEXT. In dark mode action/primary/rest is ramp[400], chosen so the brand works as a FILL and as a 3:1 non-text indicator. As a label it needs 4.5:1 and delivers 4.08:1 on surface/raised — so every outlined button, text button, active nav row and selected tab label is non-compliant in dark mode, in all nine schemes. 81 instances, one cause. The fix mirrors what focus/ring already does: derive a separate brand-as-text step, the first clearing 4.5:1 against the hardest surface (blue-300 gives 5.63:1). That changes shipped colour, so it needs sign-off.",
          "owner": "design-system",
          "decision": "token-engine-architecture.md §5.6 — the fill/indicator split, now three roles: fill, indicator, text"
        }
      }
    },
    "$borderRole": "decorative",
    "$borderNote": "Nav rows carry no edge; selection is a tint plus weight."
  },
  "tableRow": {
    "$label": "Table row",
    "$note": "Grid rows. Density comes from `layout.row*`; these are the paint states.",
    "$base": {
      "rowCondensed": {
        "$value": "{layout:rowCondensed}",
        "$type": "dimension"
      },
      "rowRegular": {
        "$value": "{layout:rowRegular}",
        "$type": "dimension"
      },
      "rowRelaxed": {
        "$value": "{layout:rowRelaxed}",
        "$type": "dimension"
      },
      "cellPaddingInline": {
        "$value": "{space:3}",
        "$type": "dimension"
      },
      "cellType": {
        "$value": "{type:body/s}",
        "$type": "typography"
      },
      "borderColor": {
        "$value": "{sem:border/subtle}",
        "$type": "color"
      }
    },
    "$variants": {
      "body": {
        "$label": "Body row",
        "$states": {
          "rest": {
            "bg": {
              "$value": "{sem:surface/raised}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/primary}",
              "$type": "color"
            },
            "border": {
              "$value": "{sem:border/subtle}",
              "$type": "color"
            }
          },
          "hover": {
            "bg": {
              "$value": "{mix:text/primary,surface/raised,4}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/primary}",
              "$type": "color"
            },
            "border": {
              "$value": "{sem:border/subtle}",
              "$type": "color"
            }
          },
          "selected": {
            "bg": {
              "$value": "{mix:action/primary/rest,surface/raised,9}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/primary}",
              "$type": "color"
            },
            "border": {
              "$value": "{sem:border/subtle}",
              "$type": "color"
            }
          }
        }
      },
      "header": {
        "$label": "Header row",
        "$states": {
          "rest": {
            "bg": {
              "$value": "{sem:surface/subtle}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/tertiary}",
              "$type": "color"
            },
            "border": {
              "$value": "{sem:border/subtle}",
              "$type": "color"
            }
          }
        }
      }
    },
    "$pairs": [],
    "$borderRole": "decorative",
    "$borderNote": "Row rules are separators, not control boundaries."
  },
  "tab": {
    "$label": "Tab",
    "$note": "Tab bar. `selected` carries both a colour and the indicator, so colour is never the only signal.",
    "$base": {
      "minHeight": {
        "$value": 40,
        "$type": "dimension"
      },
      "paddingInline": {
        "$value": "{space:3}",
        "$type": "dimension"
      },
      "labelType": {
        "$value": "{type:label/l}",
        "$type": "typography"
      },
      "indicatorHeight": {
        "$value": 2,
        "$type": "dimension"
      },
      "indicatorColor": {
        "$value": "{sem:action/primary/rest}",
        "$type": "color"
      }
    },
    "$variants": {
      "underline": {
        "$label": "Underline",
        "$states": {
          "rest": {
            "bg": {
              "$value": "transparent",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/secondary}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          },
          "hover": {
            "bg": {
              "$value": "{mix:text/primary,surface/raised,5}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/primary}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          },
          "selected": {
            "bg": {
              "$value": "transparent",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:action/primary/rest}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          },
          "disabled": {
            "bg": {
              "$value": "transparent",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/disabled}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          }
        },
        "$knownDefect": {
          "note": "THE BRAND COLOUR USED AS 14px TEXT. In dark mode action/primary/rest is ramp[400], chosen so the brand works as a FILL and as a 3:1 non-text indicator. As a label it needs 4.5:1 and delivers 4.08:1 on surface/raised — so every outlined button, text button, active nav row and selected tab label is non-compliant in dark mode, in all nine schemes. 81 instances, one cause. The fix mirrors what focus/ring already does: derive a separate brand-as-text step, the first clearing 4.5:1 against the hardest surface (blue-300 gives 5.63:1). That changes shipped colour, so it needs sign-off.",
          "owner": "design-system",
          "decision": "token-engine-architecture.md §5.6 — the fill/indicator split, now three roles: fill, indicator, text"
        }
      }
    },
    "$borderRole": "decorative",
    "$borderNote": "The selected tab is identified by its indicator and label colour, not by an edge."
  },
  "statusChip": {
    "$label": "Status chip",
    "$note": "Five tones. Colour is never the only signal — each chip carries a word, and the band ones an icon too.",
    "$base": {
      "radius": {
        "$value": "{radius:pill}",
        "$type": "dimension"
      },
      "height": {
        "$value": 22,
        "$type": "dimension"
      },
      "heightLarge": {
        "$value": 26,
        "$type": "dimension"
      },
      "paddingInline": {
        "$value": "{space:2}",
        "$type": "dimension"
      },
      "labelType": {
        "$value": "{type:label/m}",
        "$type": "typography"
      },
      "gap": {
        "$value": "{space:1}",
        "$type": "dimension"
      }
    },
    "$variants": {
      "tone": {
        "$label": "Tones",
        "$states": {
          "neutral": {
            "bg": {
              "$value": "{sem:surface/subtle}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/secondary}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          },
          "good": {
            "bg": {
              "$value": "{sem:status/success/background}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:status/success/foreground}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          },
          "info": {
            "bg": {
              "$value": "{sem:status/info/background}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:status/info/foreground}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          },
          "warning": {
            "bg": {
              "$value": "{sem:status/warning/background}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:status/warning/foreground}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          },
          "danger": {
            "bg": {
              "$value": "{sem:status/danger/background}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:status/danger/foreground}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          }
        }
      }
    },
    "$borderRole": "decorative",
    "$borderNote": "Chips are identified by fill and word, never by an outline."
  },
  "bandChip": {
    "$label": "Band chip",
    "$note": "The band system's five states. `normal` is intentionally colourless — emphasis is zero-sum, and a grid where every cell is tinted has no exceptions left to notice (AGENTS.md §2).",
    "$base": {
      "radius": {
        "$value": "{radius:pill}",
        "$type": "dimension"
      },
      "height": {
        "$value": 22,
        "$type": "dimension"
      },
      "paddingInline": {
        "$value": "{space:2}",
        "$type": "dimension"
      },
      "labelType": {
        "$value": "{type:label/m}",
        "$type": "typography"
      },
      "dotSize": {
        "$value": 8,
        "$type": "dimension"
      }
    },
    "$variants": {
      "band": {
        "$label": "Bands",
        "$states": {
          "normal": {
            "bg": {
              "$value": "transparent",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/primary}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          },
          "watch": {
            "bg": {
              "$value": "transparent",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/secondary}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          },
          "warning": {
            "bg": {
              "$value": "{sem:status/warning/background}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:status/warning/foreground}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          },
          "critical": {
            "bg": {
              "$value": "{sem:status/danger/background}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:status/danger/foreground}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          },
          "unknown": {
            "bg": {
              "$value": "{sem:surface/subtle}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/tertiary}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          }
        }
      }
    },
    "$borderRole": "decorative",
    "$borderNote": "As statusChip."
  },
  "freshnessChip": {
    "$label": "Freshness chip",
    "$note": "How old a reading is. Four states, because 'stale' and 'offline' are different facts.",
    "$base": {
      "radius": {
        "$value": "{radius:pill}",
        "$type": "dimension"
      },
      "height": {
        "$value": 20,
        "$type": "dimension"
      },
      "paddingInline": {
        "$value": "{space:2}",
        "$type": "dimension"
      },
      "labelType": {
        "$value": "{type:label/s}",
        "$type": "typography"
      }
    },
    "$variants": {
      "age": {
        "$label": "Age",
        "$states": {
          "live": {
            "bg": {
              "$value": "{sem:status/success/background}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:status/success/foreground}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          },
          "recent": {
            "bg": {
              "$value": "{sem:surface/subtle}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/secondary}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          },
          "stale": {
            "bg": {
              "$value": "{sem:status/warning/background}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:status/warning/foreground}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          },
          "offline": {
            "bg": {
              "$value": "{sem:status/danger/background}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:status/danger/foreground}",
              "$type": "color"
            },
            "border": {
              "$value": "transparent",
              "$type": "color"
            }
          }
        }
      }
    },
    "$borderRole": "decorative",
    "$borderNote": "As statusChip."
  },
  "dialog": {
    "$label": "Dialog",
    "$note": "Modal surface. Sits on `surface/overlay`, which is a distinct role from `raised` on purpose.",
    "$base": {
      "background": {
        "$value": "{sem:surface/overlay}",
        "$type": "color"
      },
      "radius": {
        "$value": "{radius:surface}",
        "$type": "dimension"
      },
      "padding": {
        "$value": "{space:5}",
        "$type": "dimension"
      },
      "titleType": {
        "$value": "{type:title/l}",
        "$type": "typography"
      },
      "titleColor": {
        "$value": "{sem:text/primary}",
        "$type": "color"
      },
      "bodyType": {
        "$value": "{type:body/m}",
        "$type": "typography"
      },
      "bodyColor": {
        "$value": "{sem:text/secondary}",
        "$type": "color"
      },
      "scrimOpacity": {
        "$value": 50,
        "$type": "dimension"
      }
    },
    "$pairs": [
      {
        "fg": "titleColor",
        "bg": "background",
        "kind": "text",
        "typeToken": "title/l"
      },
      {
        "fg": "bodyColor",
        "bg": "background",
        "kind": "text",
        "typeToken": "body/m"
      }
    ]
  },
  "tooltip": {
    "$label": "Tooltip",
    "$note": "Deliberately inverted — a tooltip that matches its surroundings reads as part of the page.",
    "$base": {
      "background": {
        "$value": "{sem:text/primary}",
        "$type": "color"
      },
      "foreground": {
        "$value": "{sem:surface/canvas}",
        "$type": "color"
      },
      "radius": {
        "$value": "{radius:control}",
        "$type": "dimension"
      },
      "paddingInline": {
        "$value": "{space:2}",
        "$type": "dimension"
      },
      "paddingBlock": {
        "$value": "{space:1}",
        "$type": "dimension"
      },
      "labelType": {
        "$value": "{type:body/s}",
        "$type": "typography"
      }
    },
    "$pairs": [
      {
        "fg": "foreground",
        "bg": "background",
        "kind": "text",
        "typeToken": "body/s"
      }
    ]
  },
  "menu": {
    "$label": "Menu",
    "$note": "Popover surface. Sits on surface/overlay, like dialog and tooltip. Item backgrounds are stated explicitly rather than left transparent so the audit scores them against the OVERLAY they actually sit on — `transparent` resolves to @behind, which is surface/raised, and would measure the wrong backdrop. No `selected` state is declared because nothing in the product renders one; inventing it would put an unscored pair in the contract wearing the look of coverage.",
    "$base": {
      "background": {
        "$value": "{sem:surface/overlay}",
        "$type": "color"
      },
      "radius": {
        "$value": "{radius:surface}",
        "$type": "dimension"
      },
      "borderColor": {
        "$value": "{sem:border/subtle}",
        "$type": "color"
      },
      "paddingBlock": {
        "$value": "{space:1}",
        "$type": "dimension"
      },
      "itemType": {
        "$value": "{type:body/m}",
        "$type": "typography"
      },
      "itemMinHeight": {
        "$value": 32,
        "$type": "dimension"
      },
      "itemPaddingInline": {
        "$value": "{space:3}",
        "$type": "dimension"
      }
    },
    "$variants": {
      "item": {
        "$label": "Item",
        "$states": {
          "rest": {
            "bg": {
              "$value": "{sem:surface/overlay}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/primary}",
              "$type": "color"
            }
          },
          "hover": {
            "bg": {
              "$value": "{mix:text/primary,surface/overlay,6}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/primary}",
              "$type": "color"
            }
          },
          "focus": {
            "bg": {
              "$value": "{sem:surface/overlay}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/primary}",
              "$type": "color"
            },
            "ring": {
              "$value": "{sem:focus/ring}",
              "$type": "color"
            }
          },
          "disabled": {
            "bg": {
              "$value": "{sem:surface/overlay}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/disabled}",
              "$type": "color"
            }
          }
        }
      }
    }
  },
  "drawer": {
    "$label": "Drawer",
    "$note": "The navigation rail's own surface.",
    "$base": {
      "background": {
        "$value": "{sem:surface/raised}",
        "$type": "color"
      },
      "border": {
        "$value": "{sem:border/subtle}",
        "$type": "color",
        "$darkValue": "{sem:border/default}"
      },
      "width": {
        "$value": "{layout:drawerWidth}",
        "$type": "dimension"
      },
      "miniWidth": {
        "$value": "{layout:miniWidth}",
        "$type": "dimension"
      },
      "padding": {
        "$value": "{space:2}",
        "$type": "dimension"
      }
    },
    "$pairs": [
      {
        "fg": "border",
        "bg": "background",
        "kind": "decorative"
      }
    ]
  },
  "pageHeader": {
    "$label": "Page header",
    "$note": "Owns the single h1. Panel titles are h2 inside PanelHeader.",
    "$base": {
      "titleType": {
        "$value": "{type:heading/3}",
        "$type": "typography"
      },
      "titleColor": {
        "$value": "{sem:text/primary}",
        "$type": "color"
      },
      "subtitleType": {
        "$value": "{type:body/l}",
        "$type": "typography"
      },
      "subtitleColor": {
        "$value": "{sem:text/secondary}",
        "$type": "color"
      },
      "crumbType": {
        "$value": "{type:body/s}",
        "$type": "typography"
      },
      "crumbColor": {
        "$value": "{sem:text/tertiary}",
        "$type": "color"
      },
      "gap": {
        "$value": "{space:2}",
        "$type": "dimension"
      }
    },
    "$pairs": [
      {
        "fg": "titleColor",
        "bg": "@surface",
        "kind": "text",
        "typeToken": "heading/3"
      },
      {
        "fg": "subtitleColor",
        "bg": "@surface",
        "kind": "text",
        "typeToken": "body/l"
      },
      {
        "fg": "crumbColor",
        "bg": "@surface",
        "kind": "text",
        "typeToken": "body/s"
      }
    ]
  },
  "emptyState": {
    "$label": "Empty state",
    "$note": "Four different nothings need four different sentences — the title names the condition.",
    "$base": {
      "minHeight": {
        "$value": 180,
        "$type": "dimension"
      },
      "padding": {
        "$value": "{space:5}",
        "$type": "dimension"
      },
      "gap": {
        "$value": "{space:2}",
        "$type": "dimension"
      },
      "titleType": {
        "$value": "{type:title/m}",
        "$type": "typography"
      },
      "titleColor": {
        "$value": "{sem:text/primary}",
        "$type": "color"
      },
      "bodyType": {
        "$value": "{type:body/m}",
        "$type": "typography"
      },
      "bodyColor": {
        "$value": "{sem:text/secondary}",
        "$type": "color"
      },
      "iconSize": {
        "$value": 28,
        "$type": "dimension"
      }
    },
    "$pairs": [
      {
        "fg": "titleColor",
        "bg": "@surface",
        "kind": "text",
        "typeToken": "title/m"
      },
      {
        "fg": "bodyColor",
        "bg": "@surface",
        "kind": "text",
        "typeToken": "body/m"
      }
    ]
  },
  "codeValue": {
    "$label": "Code value",
    "$note": "Raw device codes. Monospaced so a technician can read a hex register without transcription errors.",
    "$base": {
      "background": {
        "$value": "{sem:surface/subtle}",
        "$type": "color"
      },
      "radius": {
        "$value": "{radius:control}",
        "$type": "dimension"
      },
      "paddingInline": {
        "$value": "{space:1}",
        "$type": "dimension"
      },
      "valueType": {
        "$value": "{type:data/mono}",
        "$type": "typography"
      },
      "valueColor": {
        "$value": "{sem:text/primary}",
        "$type": "color"
      },
      "rawColor": {
        "$value": "{sem:text/tertiary}",
        "$type": "color"
      }
    },
    "$pairs": [
      {
        "fg": "valueColor",
        "bg": "background",
        "kind": "text",
        "typeToken": "data/mono"
      },
      {
        "fg": "rawColor",
        "bg": "background",
        "kind": "text",
        "typeToken": "data/mono"
      }
    ]
  },
  "alert": {
    "$label": "Alert",
    "$note": "Outlined banner, four severities. The BORDER is deliberately not declared a control edge: MUI's Alert always renders a severity icon beside the text, so the colour is redundant signal rather than the only one, and demanding 3:1 of it would buy nothing a reader can use. The text pair is what carries the meaning and is what gets scored.",
    "$base": {
      "radius": {
        "$value": "{radius:surface}",
        "$type": "dimension"
      },
      "paddingInline": {
        "$value": "{space:4}",
        "$type": "dimension"
      },
      "paddingBlock": {
        "$value": "{space:3}",
        "$type": "dimension"
      },
      "borderWidth": {
        "$value": 1,
        "$type": "dimension"
      },
      "labelType": {
        "$value": "{type:body/m}",
        "$type": "typography"
      },
      "gap": {
        "$value": "{space:2}",
        "$type": "dimension"
      }
    },
    "$variants": {
      "tone": {
        "$label": "Severities",
        "$states": {
          "good": {
            "bg": {
              "$value": "{sem:status/success/background}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:status/success/foreground}",
              "$type": "color"
            },
            "border": {
              "$value": "{sem:status/success/foreground}",
              "$type": "color"
            }
          },
          "info": {
            "bg": {
              "$value": "{sem:status/info/background}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:status/info/foreground}",
              "$type": "color"
            },
            "border": {
              "$value": "{sem:status/info/foreground}",
              "$type": "color"
            }
          },
          "warning": {
            "bg": {
              "$value": "{sem:status/warning/background}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:status/warning/foreground}",
              "$type": "color"
            },
            "border": {
              "$value": "{sem:status/warning/foreground}",
              "$type": "color"
            }
          },
          "danger": {
            "bg": {
              "$value": "{sem:status/danger/background}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:status/danger/foreground}",
              "$type": "color"
            },
            "border": {
              "$value": "{sem:status/danger/foreground}",
              "$type": "color"
            }
          }
        }
      }
    }
  },
  "checkbox": {
    "$label": "Checkbox",
    "$note": "MUI renders the checkbox as an SVG whose `color` drives the stroke when unchecked and the FILL when checked — and in the checked icon the tick is NEGATIVE SPACE, so it shows whatever sits behind the control rather than a colour we choose. That is why `fg` on the selected state is surface/raised and not {derive:onBrand}: the token has to name the colour the product actually paints, and a derived label here would describe an icon MUI does not draw.",
    "$borderRole": "control",
    "$base": {
      "size": {
        "$value": 18,
        "$type": "dimension"
      },
      "radius": {
        "$value": "{radius:sharp}",
        "$type": "dimension"
      },
      "borderWidth": {
        "$value": 1.5,
        "$type": "dimension"
      }
    },
    "$variants": {
      "box": {
        "$label": "Box",
        "$states": {
          "rest": {
            "bg": {
              "$value": "{sem:surface/raised}",
              "$type": "color"
            },
            "border": {
              "$value": "{sem:border/strong}",
              "$type": "color"
            }
          },
          "hover": {
            "bg": {
              "$value": "{mix:action/primary/rest,surface/raised,6}",
              "$type": "color"
            },
            "border": {
              "$value": "{sem:action/primary/indicator}",
              "$type": "color"
            }
          },
          "selected": {
            "bg": {
              "$value": "{sem:action/primary/rest}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:surface/raised}",
              "$type": "color"
            },
            "$knownDefect": {
              "note": "The tick in MUI's checked icon is NEGATIVE SPACE — a cut-out in a single filled path — so it renders as whatever sits behind the control and cannot be given a derived colour. Against the brand fill that lands between 2.96:1 (Sunset) and 4.32:1 (Indigo) in 8 of 18 scheme/mode combinations. Same family as the 113 brand-as-text rows: a light foreground on the brand step at small size. Darkening the fill does not fix it — Sunset's pressed step fails against white AND near-black. The fix is a custom `checkedIcon` whose tick is a real path taking {derive:onBrand}, which is app code, not a token change. Found by contracting the component; it has been rendering this way unmeasured.",
              "owner": "design-system",
              "decision": "docs/design-system-adapters.md — P1 component contracting"
            }
          },
          "focus": {
            "bg": {
              "$value": "{sem:surface/raised}",
              "$type": "color"
            },
            "border": {
              "$value": "{sem:focus/ring}",
              "$type": "color"
            },
            "ring": {
              "$value": "{sem:focus/ring}",
              "$type": "color"
            }
          },
          "disabled": {
            "bg": {
              "$value": "{sem:surface/subtle}",
              "$type": "color"
            },
            "fg": {
              "$value": "{sem:text/disabled}",
              "$type": "color"
            },
            "border": {
              "$value": "{sem:border/default}",
              "$type": "color"
            }
          }
        }
      }
    }
  }
};

/** Body-face presets. The ramp itself never changes — only the family. */
export const fonts = {
  "inter": {
    "label": "Inter",
    "stack": "\"Inter\", system-ui, sans-serif"
  },
  "system": {
    "label": "System",
    "stack": "system-ui, -apple-system, \"Segoe UI\", sans-serif"
  },
  "dmsans": {
    "label": "DM Sans",
    "stack": "\"DM Sans\", \"Inter\", sans-serif"
  },
  "publicsans": {
    "label": "Public Sans",
    "stack": "\"Public Sans\", \"Inter\", sans-serif"
  },
  "nunito": {
    "label": "Nunito Sans",
    "stack": "\"Nunito Sans\", \"Inter\", sans-serif"
  },
  "roboto": {
    "label": "Roboto",
    "stack": "\"Roboto\", \"Inter\", sans-serif"
  },
  "serif": {
    "label": "Serif",
    "stack": "Georgia, \"Times New Roman\", serif"
  }
};

export const spacing = {
  "0": 0,
  "1": 4,
  "2": 8,
  "3": 12,
  "4": 16,
  "5": 20,
  "6": 24,
  "8": 32,
  "10": 40,
  "12": 48,
  "16": 64
};
export const shadow = {
  "light": {
    "none": "none",
    "xs": "0px 1px 2px 0px rgba(20, 20, 20, 0.06)",
    "sm": "0px 2px 6px -1px rgba(20, 20, 20, 0.08)",
    "md": "0px 6px 16px -4px rgba(20, 20, 20, 0.1)",
    "lg": "0px 12px 32px -8px rgba(20, 20, 20, 0.14)"
  },
  "dark": {
    "none": "none",
    "xs": "0px 1px 2px 0px rgba(20, 20, 20, 0.3)",
    "sm": "0px 2px 6px -1px rgba(20, 20, 20, 0.36)",
    "md": "0px 6px 16px -4px rgba(20, 20, 20, 0.44)",
    "lg": "0px 12px 32px -8px rgba(20, 20, 20, 0.52)"
  }
};

export const radius = {
  "none": 0,
  "sharp": 2,
  "control": 4,
  "surface": 8,
  "large": 12,
  "xl": 16,
  "pill": 999
};
export const motion = {
  "fast": 120,
  "medium": 190,
  "slow": 280,
  "easing": "cubic-bezier(0.2, 0, 0, 1)"
};
export const layout = {
  "drawerWidth": 280,
  "miniWidth": 76,
  "topBarXs": 64,
  "topBarSm": 72,
  "contentPadXs": 16,
  "contentPadSm": 24,
  "contentMaxWidth": 1280,
  "footerMinHeight": 52,
  "settingsPanel": 400,
  "assistantPanel": 440,
  "targetMin": 24,
  "rowCondensed": 40,
  "rowRegular": 48,
  "rowRelaxed": 56
};

/**
 * Resolve a semantic token for a mode.
 *   sem("dark", "surface/canvas") → "#141414"
 */
export function sem(mode, path) {
  const hex = semantic[mode === "dark" ? "dark" : "light"][path];
  if (!hex) throw new Error(`unknown semantic token: ${path}`);
  return hex;
}

/**
 * The CSS custom property for a semantic token, for the rare case something
 * outside MUI needs it (scrollbars, print rules, raw canvas).
 *   cssVar("surface/canvas") → "var(--genus-surface-canvas)"
 */
export const cssVar = (path) => `var(--genus-${path.replace(/\//g, "-")})`;

/** Every type style as a ready-to-spread sx object. */
export const font = Object.fromEntries(
  Object.entries(type.styles).map(([k, s]) => [
    k,
    {
      fontSize: s.size,
      fontWeight: s.weight,
      lineHeight: `${s.lineHeight}px`,
      letterSpacing: `${s.tracking}px`,
    },
  ]),
);
