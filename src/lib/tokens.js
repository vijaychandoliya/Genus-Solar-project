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
      "onBrand": "#ffffff"
    },
    "dark": {
      "rest": "#5598d0",
      "hover": "#80b2df",
      "pressed": "#aacbed",
      "focus": "#80b2df",
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
      "onBrand": "#141414"
    },
    "dark": {
      "rest": "#f28e36",
      "hover": "#f6aa68",
      "pressed": "#f9c69a",
      "focus": "#f6aa68",
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
      "onBrand": "#000000"
    },
    "dark": {
      "rest": "#8199f8",
      "hover": "#b6c4fb",
      "pressed": "#ebeffe",
      "focus": "#b6c4fb",
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
      "onBrand": "#ffffff"
    },
    "dark": {
      "rest": "#9e6df2",
      "hover": "#c0a1f6",
      "pressed": "#e3d4fb",
      "focus": "#c0a1f6",
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
      "onBrand": "#141414"
    },
    "dark": {
      "rest": "#53b366",
      "hover": "#7ac489",
      "pressed": "#a1d5ab",
      "focus": "#7ac489",
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
      "onBrand": "#000000"
    },
    "dark": {
      "rest": "#979de2",
      "hover": "#c3c7ee",
      "pressed": "#eff0fb",
      "focus": "#c3c7ee",
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
      "onBrand": "#141414"
    },
    "dark": {
      "rest": "#3fc6c6",
      "hover": "#6ad3d3",
      "pressed": "#96e0e0",
      "focus": "#6ad3d3",
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
      "onBrand": "#141414"
    },
    "dark": {
      "rest": "#3bbf81",
      "hover": "#64cf9c",
      "pressed": "#8edcb7",
      "focus": "#64cf9c",
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
      "onBrand": "#ffffff"
    },
    "dark": {
      "rest": "#549ba2",
      "hover": "#76b2b8",
      "pressed": "#9bc7cb",
      "focus": "#76b2b8",
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
export const radius = {
  "control": 4,
  "surface": 8,
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
