/**
 * GENERATED FROM docs/screen-guides — DO NOT HAND-EDIT.
 *
 * Regenerate with `npm run help`. Edit the guide, not this file: the panel is a
 * projection of the documentation, and hand-editing here would create exactly
 * the drift between the product and its docs that the projection prevents.
 *
 * Emitted 2026-09-07 from 21 guides
 * covering 22 routes.
 */

/** Panel sections, in the order the panel renders them. */
export const HELP_SECTIONS = [
  {
    "key": "useCases",
    "label": "What you can do here"
  },
  {
    "key": "questions",
    "label": "Common questions"
  },
  {
    "key": "troubleshooting",
    "label": "If something looks wrong"
  },
  {
    "key": "states",
    "label": "Why the screen looks like this"
  },
  {
    "key": "audience",
    "label": "Who this screen is for"
  },
  {
    "key": "access",
    "label": "How to get here"
  }
];

/** Route → guide. Routes with a `:param` are matched by prefix — see helpFor(). */
export const HELP_BY_ROUTE = {
 "/admin/organisation": {
  "routes": [
   "/admin/organisation"
  ],
  "title": "Administration — Organisation",
  "summary": [
   {
    "t": "text",
    "v": "The "
   },
   {
    "t": "b",
    "parts": [
     {
      "t": "text",
      "v": "whole"
     }
    ]
   },
   {
    "t": "text",
    "v": " discom hierarchy, flattened — every node from every level, browsable and exportable in one place."
   }
  ],
  "aliases": [
   "hierarchy",
   "org structure",
   "circles districts panchayats",
   "discom structure",
   "areas"
  ],
  "related": [
   "/overview",
   "/sites"
  ],
  "updated": "2026-08-24",
  "doc": "docs/screen-guides/admin-organisation.md",
  "useCases": [
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"What is this panchayat's full path?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Find the row; the parent path is on it."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Export the whole structure.\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Use the table's export."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Does this area exist in our data?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "If it is not here, it is not in either extract."
     }
    ]
   }
  ],
  "questions": [
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why do some areas show 0 registered?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. The SASARAM branch carries zero at every leaf because those consumers are not in the consumer master. The two extracts cover different circles and do not overlap."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Can I add or rename an area?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. No. The hierarchy is "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "generated from the source CSVs at build time"
       }
      ]
     },
     {
      "t": "text",
      "v": " and the generated file carries a DO-NOT-HAND-EDIT banner. Changes happen in the source data."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why do node ids look like slugs?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. They are generated. The source "
     },
     {
      "t": "code",
      "v": "* Code"
     },
     {
      "t": "text",
      "v": " columns are not usable as ids."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. How is this different from Overview's table?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Overview shows the current scope's "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "children"
       }
      ]
     },
     {
      "t": "text",
      "v": ". This shows "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "every node at every level"
       }
      ]
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   }
  ],
  "troubleshooting": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Symptom"
      }
     ],
     [
      {
       "t": "text",
       "v": "Likely cause"
      }
     ],
     [
      {
       "t": "text",
       "v": "What to do"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "text",
        "v": "An area is missing"
       }
      ],
      [
       {
        "t": "text",
        "v": "Not in either extract"
       }
      ],
      [
       {
        "t": "text",
        "v": "Check the source data"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Zero registered"
       }
      ],
      [
       {
        "t": "text",
        "v": "SASARAM branch"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Cannot edit"
       }
      ],
      [
       {
        "t": "text",
        "v": "Generated"
       }
      ],
      [
       {
        "t": "text",
        "v": "Change the source and re-import"
       }
      ]
     ]
    ]
   }
  ],
  "states": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "State"
      }
     ],
     [
      {
       "t": "text",
       "v": "When"
      }
     ],
     [
      {
       "t": "text",
       "v": "What the user sees"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Populated"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Always"
       }
      ],
      [
       {
        "t": "text",
        "v": "The full hierarchy"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Zero-registered branches"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "SASARAM"
       }
      ],
      [
       {
        "t": "code",
        "v": "0"
       },
       {
        "t": "text",
        "v": " at every leaf — expected"
       }
      ]
     ]
    ]
   }
  ],
  "audience": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Role"
      }
     ],
     [
      {
       "t": "text",
       "v": "Why"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Admin / Super Admin"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Reference and export the structure"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Analyst"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Confirm a node's place in the hierarchy"
       }
      ]
     ]
    ]
   },
   {
    "type": "quote",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Roles are designed, not enforced."
       }
      ]
     },
     {
      "t": "text",
      "v": " See "
     },
     {
      "t": "text",
      "v": "README"
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   }
  ],
  "access": [
   {
    "type": "table",
    "head": [
     [],
     []
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Route"
         }
        ]
       }
      ],
      [
       {
        "t": "code",
        "v": "/admin/organisation"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Navigation"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Rail → Administration → Organisation"
       }
      ]
     ]
    ]
   }
  ]
 },
 "/admin/roles": {
  "routes": [
   "/admin/roles"
  ],
  "title": "Administration — Roles",
  "summary": [
   {
    "t": "text",
    "v": "An editable access matrix over five roles. "
   },
   {
    "t": "b",
    "parts": [
     {
      "t": "text",
      "v": "It governs nothing today, and it does not survive a reload."
     }
    ]
   }
  ],
  "aliases": [
   "permissions",
   "access matrix",
   "roles",
   "RBAC",
   "who can do what",
   "access control"
  ],
  "related": [
   "/admin/users",
   "/alarms/rules"
  ],
  "updated": "2026-08-24",
  "doc": "docs/screen-guides/admin-roles.md",
  "useCases": [
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Design our access model.\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Edit the matrix, then capture "
     },
     {
      "t": "i",
      "v": "Changed from plan"
     },
     {
      "t": "text",
      "v": " — that diff is the deliverable."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Restrict Analysts from the admin screens.\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "You can express it here. "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "It will not take effect."
       }
      ]
     },
     {
      "t": "text",
      "v": " §14."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Which roles exist?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "The five columns."
     }
    ]
   }
  ],
  "questions": [
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. I set permissions but nothing changed."
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Correct. There is no auth layer, so these grants govern nothing. No route guard or conditional rendering reads this matrix."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. My changes disappeared after reload."
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Expected — nothing persists. Capture "
     },
     {
      "t": "i",
      "v": "Changed from plan"
     },
     {
      "t": "text",
      "v": " before leaving."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Then what is this screen for?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Designing and recording an access model. Every edit lands on a copy so the diff is exact — a workshop where someone toggles fifteen cells is useless if nobody can reconstruct which fifteen."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Can I use this to restrict a user right now?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. No. Nothing in the product is permission-gated."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. How is this different from Alarm rules?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Alarm rules are "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "load-bearing today"
       }
      ]
     },
     {
      "t": "text",
      "v": " — editing one repaints the product. This governs nothing."
     }
    ]
   }
  ],
  "troubleshooting": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Symptom"
      }
     ],
     [
      {
       "t": "text",
       "v": "Likely cause"
      }
     ],
     [
      {
       "t": "text",
       "v": "What to do"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "text",
        "v": "Permissions have no effect"
       }
      ],
      [
       {
        "t": "text",
        "v": "No enforcement exists"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Changes lost"
       }
      ],
      [
       {
        "t": "text",
        "v": "No persistence"
       }
      ],
      [
       {
        "t": "text",
        "v": "Record the diff first"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "A user still sees everything"
       }
      ],
      [
       {
        "t": "text",
        "v": "Same reason"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected"
       }
      ]
     ]
    ]
   }
  ],
  "states": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "State"
      }
     ],
     [
      {
       "t": "text",
       "v": "When"
      }
     ],
     [
      {
       "t": "text",
       "v": "What the user sees"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Baseline"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Fresh load"
       }
      ],
      [
       {
        "t": "text",
        "v": "The specified matrix"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Edited"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "After toggling"
       }
      ],
      [
       {
        "t": "i",
        "v": "Changed from plan"
       },
       {
        "t": "text",
        "v": " > 0"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "After reload"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Always"
       }
      ],
      [
       {
        "t": "text",
        "v": "Back to baseline"
       }
      ]
     ]
    ]
   }
  ],
  "audience": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Role"
      }
     ],
     [
      {
       "t": "text",
       "v": "Why"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Admin / Super Admin"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Design the access model"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Analyst"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Understand the intended model"
       }
      ]
     ]
    ]
   },
   {
    "type": "quote",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Roles are designed, not enforced — and this is the screen that designs them."
       }
      ]
     },
     {
      "t": "text",
      "v": " See "
     },
     {
      "t": "text",
      "v": "README"
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   }
  ],
  "access": [
   {
    "type": "table",
    "head": [
     [],
     []
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Route"
         }
        ]
       }
      ],
      [
       {
        "t": "code",
        "v": "/admin/roles"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Navigation"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Rail → Administration → Roles"
       }
      ]
     ]
    ]
   }
  ]
 },
 "/admin/users": {
  "routes": [
   "/admin/users"
  ],
  "title": "Administration — Users",
  "summary": [
   {
    "t": "text",
    "v": "Two populations in one table: accounts "
   },
   {
    "t": "b",
    "parts": [
     {
      "t": "text",
      "v": "observed in the data"
     }
    ]
   },
   {
    "t": "text",
    "v": ", and accounts "
   },
   {
    "t": "b",
    "parts": [
     {
      "t": "text",
      "v": "provisioned here"
     }
    ]
   },
   {
    "t": "text",
    "v": ". They are not the same thing."
   }
  ],
  "aliases": [
   "users",
   "accounts",
   "people",
   "user management",
   "add user",
   "provisioning"
  ],
  "related": [
   "/admin/roles",
   "/admin/organisation"
  ],
  "updated": "2026-08-24",
  "doc": "docs/screen-guides/admin-users.md",
  "useCases": [
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Who surveyed this area?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Observed accounts and their real survey counts."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Draft an access list for the workshop.\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Add provisioned users — but export or record the outcome before reloading. §14."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Why does this user show 0 surveys?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "If provisioned, that is a true zero."
     }
    ]
   }
  ],
  "questions": [
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. I added a user and they vanished after reload."
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Expected. There is no auth backend, so a provisioned account reaches no server. The screen states this in the subtitle, the dialog and the row's origin chip."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. What is the difference between Observed and Provisioned?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Observed accounts are read off the extracts — their role describes what they "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "did"
       }
      ]
     },
     {
      "t": "text",
      "v": ". Provisioned accounts are created here with an RBAC role and scope, and have done nothing yet."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why does a provisioned user show 0 surveys instead of blank?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Because it is a "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "true zero"
       }
      ]
     },
     {
      "t": "text",
      "v": ", not a missing value. They genuinely have done nothing."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Does assigning a role restrict anything?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. No. No enforcement exists anywhere in the application."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why offer a form that does not save?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. To draft and discuss an access list. The screen is explicit about the limit in three places, because a form that silently discards its submit would be worse than no form."
     }
    ]
   }
  ],
  "troubleshooting": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Symptom"
      }
     ],
     [
      {
       "t": "text",
       "v": "Likely cause"
      }
     ],
     [
      {
       "t": "text",
       "v": "What to do"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "text",
        "v": "Added users disappear"
       }
      ],
      [
       {
        "t": "text",
        "v": "No backend"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected; record the outcome elsewhere"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "A role has no effect"
       }
      ],
      [
       {
        "t": "text",
        "v": "No enforcement"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Someone missing"
       }
      ],
      [
       {
        "t": "text",
        "v": "Only appears if in the extracts or added here"
       }
      ],
      [
       {
        "t": "text",
        "v": "Add them"
       }
      ]
     ]
    ]
   }
  ],
  "states": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "State"
      }
     ],
     [
      {
       "t": "text",
       "v": "When"
      }
     ],
     [
      {
       "t": "text",
       "v": "What the user sees"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Observed only"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Fresh load"
       }
      ],
      [
       {
        "t": "text",
        "v": "Accounts from the extracts"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "With provisioned"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "After adding"
       }
      ],
      [
       {
        "t": "text",
        "v": "Extra rows with the Provisioned chip"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "After reload"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Always"
       }
      ],
      [
       {
        "t": "text",
        "v": "Provisioned rows gone"
       }
      ]
     ]
    ]
   }
  ],
  "audience": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Role"
      }
     ],
     [
      {
       "t": "text",
       "v": "Why"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Admin / Super Admin"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Draft the access list"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Analyst"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Who produced a survey"
       }
      ]
     ]
    ]
   },
   {
    "type": "quote",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Roles are designed, not enforced."
       }
      ]
     },
     {
      "t": "text",
      "v": " See "
     },
     {
      "t": "text",
      "v": "README"
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   }
  ],
  "access": [
   {
    "type": "table",
    "head": [
     [],
     []
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Route"
         }
        ]
       }
      ],
      [
       {
        "t": "code",
        "v": "/admin/users"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Navigation"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Rail → Administration → Users"
       }
      ]
     ]
    ]
   }
  ]
 },
 "/alarms/rules": {
  "routes": [
   "/alarms/rules"
  ],
  "title": "Alarms — Rules",
  "summary": [
   {
    "t": "text",
    "v": "The thresholds that decide what counts as good, bad or unjudgeable. "
   },
   {
    "t": "b",
    "parts": [
     {
      "t": "text",
      "v": "Editing here changes the product immediately."
     }
    ]
   }
  ],
  "aliases": [
   "thresholds",
   "bands",
   "alarm rules",
   "limits",
   "band registry",
   "metric thresholds"
  ],
  "related": [
   "/alarms",
   "/telemetry/bms",
   "/telemetry/ups",
   "/telemetry/meter"
  ],
  "updated": "2026-08-24",
  "doc": "docs/screen-guides/alarms-rules.md",
  "useCases": [
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Why is this reading amber?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Find the metric, read its bounds."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"What would happen if we loosened this limit?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Change it and look at "
     },
     {
      "t": "link",
      "v": "Alarms",
      "href": "/alarms"
     },
     {
      "t": "text",
      "v": " and the telemetry screens — which is precisely why it is editable."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Which thresholds are still guesses?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "On seed thresholds"
       }
      ]
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   }
  ],
  "questions": [
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Does editing here actually change anything?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Yes — immediately, product-wide. Every "
     },
     {
      "t": "code",
      "v": "bandFor"
     },
     {
      "t": "text",
      "v": " call reads the registry at call time, so moving a bound repaints Alarms, Overview and every telemetry grid on the next render."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. How is this different from the Roles screen?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Roles governs nothing until an auth layer exists. "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "These thresholds are load-bearing today."
       }
      ]
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. What does \"on seed thresholds\" mean?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Thresholds that are still assumptions rather than measured values. A seed threshold banding real telemetry is a guess with a colour on it."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. What does \"gated on nameplate\" mean?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. The metric cannot band until the device registry carries a required field — UPS load % needs "
     },
     {
      "t": "code",
      "v": "rated_va"
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Do my changes persist?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. — not verified for this guide."
     }
    ]
   }
  ],
  "troubleshooting": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Symptom"
      }
     ],
     [
      {
       "t": "text",
       "v": "Likely cause"
      }
     ],
     [
      {
       "t": "text",
       "v": "What to do"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "text",
        "v": "Values rebanded unexpectedly"
       }
      ],
      [
       {
        "t": "text",
        "v": "Someone edited a threshold"
       }
      ],
      [
       {
        "t": "text",
        "v": "Check "
       },
       {
        "t": "i",
        "v": "Changed from shipped"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "A metric never bands"
       }
      ],
      [
       {
        "t": "text",
        "v": "Gated on a missing nameplate"
       }
      ],
      [
       {
        "t": "text",
        "v": "Complete it on "
       },
       {
        "t": "link",
        "v": "Devices",
        "href": "/assets"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Thresholds look arbitrary"
       }
      ],
      [
       {
        "t": "text",
        "v": "Some are seeds"
       }
      ],
      [
       {
        "t": "text",
        "v": "Check the seed count"
       }
      ]
     ]
    ]
   }
  ],
  "states": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "State"
      }
     ],
     [
      {
       "t": "text",
       "v": "When"
      }
     ],
     [
      {
       "t": "text",
       "v": "What the user sees"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Populated"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Always"
       }
      ],
      [
       {
        "t": "text",
        "v": "The registry"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Changed"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "After an edit"
       }
      ],
      [
       {
        "t": "i",
        "v": "Changed from shipped"
       },
       {
        "t": "text",
        "v": " rises"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Gated"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Metric needs a nameplate"
       }
      ],
      [
       {
        "t": "text",
        "v": "Marked as such"
       }
      ]
     ]
    ]
   }
  ],
  "audience": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Role"
      }
     ],
     [
      {
       "t": "text",
       "v": "Why"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Analyst"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Why a value bands the way it does"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Admin / Super Admin"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Tune thresholds and see the cost"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Service Engineer"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "What limit triggered an alarm"
       }
      ]
     ]
    ]
   },
   {
    "type": "quote",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Roles are designed, not enforced."
       }
      ]
     },
     {
      "t": "text",
      "v": " See "
     },
     {
      "t": "text",
      "v": "README"
     },
     {
      "t": "text",
      "v": ". "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "On this screen that gap matters more than anywhere else"
       }
      ]
     },
     {
      "t": "text",
      "v": " — the edits are real."
     }
    ]
   }
  ],
  "access": [
   {
    "type": "table",
    "head": [
     [],
     []
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Route"
         }
        ]
       }
      ],
      [
       {
        "t": "code",
        "v": "/alarms/rules"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Navigation"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Rail → Alarms → Rules"
       }
      ]
     ]
    ]
   }
  ]
 },
 "/alarms": {
  "routes": [
   "/alarms"
  ],
  "title": "Alarms",
  "summary": [
   {
    "t": "text",
    "v": "The "
   },
   {
    "t": "b",
    "parts": [
     {
      "t": "text",
      "v": "exceptions inbox"
     }
    ]
   },
   {
    "t": "text",
    "v": " — every real defect found in the source data, in one list."
   }
  ],
  "aliases": [
   "exceptions",
   "alerts",
   "issues",
   "defects",
   "problems",
   "exceptions inbox",
   "alarm list"
  ],
  "related": [
   "/alarms/rules",
   "/sites",
   "/assets",
   "/overview"
  ],
  "updated": "2026-08-24",
  "doc": "docs/screen-guides/alarms.md",
  "useCases": [
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"What needs attention in my area?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Set scope → read the table. Sort by severity."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Why does this consumer have no match?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "i",
      "v": "Unmatched consumer"
     },
     {
      "t": "text",
      "v": " — the survey and master extracts cover different circles. §14."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Which surveys can't be trusted?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Filter type = "
     },
     {
      "t": "i",
      "v": "Contradictory survey"
     },
     {
      "t": "text",
      "v": ". Those need a revisit."
     }
    ]
   }
  ],
  "questions": [
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. What is an \"Unmatched consumer\"?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. The survey's consumer number has no row in the registered master. It happens because the two source extracts cover different areas — the master covers JAMUI, the survey covers SASARAM/Kaimur, and they do not overlap."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. What is a \"Contradictory survey\"?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. The survey says "
     },
     {
      "t": "i",
      "v": "Rooftop Available? = No"
     },
     {
      "t": "text",
      "v": " while also recording roof structure and ladder access. Both cannot be true."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why is \"From devices\" always zero?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. The device arrays in "
     },
     {
      "t": "code",
      "v": "device-data.js"
     },
     {
      "t": "text",
      "v": " are empty on purpose — no DMS extract has been received."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Can I acknowledge or close an alarm?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. No. This is a read-only inbox; there is no write path in the application."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Where are the filters?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. In the column headers. A page-level filter bar would duplicate them."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Are these real problems or demo data?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Real. Every row is what the rules actually find in the 9 transcribed survey rows."
     }
    ]
   }
  ],
  "troubleshooting": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Symptom"
      }
     ],
     [
      {
       "t": "text",
       "v": "Likely cause"
      }
     ],
     [
      {
       "t": "text",
       "v": "What to do"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "text",
        "v": "No alarms"
       }
      ],
      [
       {
        "t": "text",
        "v": "None in scope"
       }
      ],
      [
       {
        "t": "text",
        "v": "Widen scope"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Same alarm repeatedly"
       }
      ],
      [
       {
        "t": "text",
        "v": "One per affected record"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Can't close an alarm"
       }
      ],
      [
       {
        "t": "text",
        "v": "No write path exists"
       }
      ],
      [
       {
        "t": "text",
        "v": "Fix the source data and re-import"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "\"From devices\" zero"
       }
      ],
      [
       {
        "t": "text",
        "v": "No device extract"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected"
       }
      ]
     ]
    ]
   }
  ],
  "states": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "State"
      }
     ],
     [
      {
       "t": "text",
       "v": "When"
      }
     ],
     [
      {
       "t": "text",
       "v": "What the user sees"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Populated"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Exceptions in scope"
       }
      ],
      [
       {
        "t": "text",
        "v": "The list"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Empty"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "None in scope"
       }
      ],
      [
       {
        "t": "text",
        "v": "Empty state"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "From devices = 0"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Always, today"
       }
      ],
      [
       {
        "t": "text",
        "v": "Zero — expected"
       }
      ]
     ]
    ]
   }
  ],
  "audience": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Role"
      }
     ],
     [
      {
       "t": "text",
       "v": "Why"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Service Engineer"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "The work list"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Analyst"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Whether the data can be trusted before quoting it"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Admin / Super Admin"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Volume and severity of defects"
       }
      ]
     ]
    ]
   },
   {
    "type": "quote",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Roles are designed, not enforced."
       }
      ]
     },
     {
      "t": "text",
      "v": " See "
     },
     {
      "t": "text",
      "v": "README"
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   }
  ],
  "access": [
   {
    "type": "table",
    "head": [
     [],
     []
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Route"
         }
        ]
       }
      ],
      [
       {
        "t": "code",
        "v": "/alarms"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Navigation"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Rail → Alarms"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Also from"
         }
        ]
       }
      ],
      [
       {
        "t": "link",
        "v": "Overview",
        "href": "/overview"
       },
       {
        "t": "text",
        "v": " → "
       },
       {
        "t": "i",
        "v": "Open exceptions"
       },
       {
        "t": "text",
        "v": " tile"
       }
      ]
     ]
    ]
   }
  ]
 },
 "/admin/appearance": {
  "routes": [
   "/admin/appearance"
  ],
  "title": "Appearance",
  "summary": [
   {
    "t": "text",
    "v": "Choose how Genus Solar looks. Six complete appearances, every one "
   },
   {
    "t": "b",
    "parts": [
     {
      "t": "text",
      "v": "checked for readability before it shipped"
     }
    ]
   },
   {
    "t": "text",
    "v": ", applied to the whole product in one click and reversible in one more."
   }
  ],
  "aliases": [
   "looks",
   "themes",
   "theme picker",
   "styling",
   "branding",
   "dark mode",
   "colours"
  ],
  "related": [
   "/admin/design-tokens",
   "/gallery"
  ],
  "updated": "2026-08-24",
  "doc": "docs/screen-guides/appearance.md",
  "useCases": [
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Our engineers can't read the screen outdoors.\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Pick "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Field"
       }
      ]
     },
     {
      "t": "text",
      "v": " — high contrast, larger type."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"This is too bright for the control room at night.\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Pick "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Contrast Dark"
       }
      ]
     },
     {
      "t": "text",
      "v": ". It also fixes 25 readability problems Standard has."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"We need more rows on screen.\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Pick "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Compact"
       }
      ]
     },
     {
      "t": "text",
      "v": " — condensed rows and tighter spacing, colour unchanged."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"I tried one and want to go back.\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "i",
      "v": "Back to <previous>"
     },
     {
      "t": "text",
      "v": ", or pick "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Standard"
       }
      ]
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"I changed a colour last week and the new Look looks wrong.\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Your edit is overriding it. Re-pick the Look and choose "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Use the Look's"
       }
      ]
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   }
  ],
  "questions": [
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Will picking a Look change my data?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. No. Appearance only."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Does my choice affect other users?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. No. It is stored in your browser only. Another person, or another device, sees Standard."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. What does \"Readable\" mean?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. The build checked this Look against 145 rendered colour pairings across 9 accent colours and both light and dark, and it introduces no readability problem. A Look that did could not have been built."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. What does \"fixes 25 problems\" mean?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. That Look repairs 25 readability shortfalls the standard appearance has."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. I picked a Look but part of the screen looks wrong."
       }
      ]
     },
     {
      "t": "text",
      "v": " A. You have an earlier token-editor edit overriding it. Re-pick the Look and choose "
     },
     {
      "t": "i",
      "v": "Use the Look's"
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Will a Look change my accent colour or dark mode?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. No — separate settings, stated in the panel note."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Can I make my own Look?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Not from this screen. Looks are authored as files. Whether user-authored Looks will be offered is."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Which Look is best for outdoors?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Field"
       }
      ]
     },
     {
      "t": "text",
      "v": " — high contrast, larger type, built for glare."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. How do I get back to normal?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Pick "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Standard"
       }
      ]
     },
     {
      "t": "text",
      "v": ". It is permanent and never removable."
     }
    ]
   }
  ],
  "troubleshooting": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Symptom"
      }
     ],
     [
      {
       "t": "text",
       "v": "Likely cause"
      }
     ],
     [
      {
       "t": "text",
       "v": "What to do"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "text",
        "v": "Look reverts after reload"
       }
      ],
      [
       {
        "t": "code",
        "v": "localStorage"
       },
       {
        "t": "text",
        "v": " unavailable"
       }
      ],
      [
       {
        "t": "text",
        "v": "Leave private browsing / free space"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Part of the UI ignores the Look"
       }
      ],
      [
       {
        "t": "text",
        "v": "An earlier token-editor override"
       }
      ],
      [
       {
        "t": "text",
        "v": "Re-pick → "
       },
       {
        "t": "i",
        "v": "Use the Look's"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Colleague sees a different appearance"
       }
      ],
      [
       {
        "t": "text",
        "v": "Per-browser preference"
       }
      ],
      [
       {
        "t": "text",
        "v": "Ask them to pick the same Look"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Dialog appears unexpectedly"
       }
      ],
      [
       {
        "t": "text",
        "v": "You made token edits earlier"
       }
      ],
      [
       {
        "t": "text",
        "v": "Read the list; it names them plainly"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Card miniatures all look alike"
       }
      ],
      [
       {
        "t": "text",
        "v": "Some Looks differ in spacing and shape, not colour"
       }
      ],
      [
       {
        "t": "text",
        "v": "Compare Compact and Field for density and corners"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Cannot find how to make a Look"
       }
      ],
      [
       {
        "t": "text",
        "v": "Not offered in the UI"
       }
      ],
      [
       {
        "t": "text",
        "v": "Authored as files"
       }
      ]
     ]
    ]
   }
  ],
  "states": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "State"
      }
     ],
     [
      {
       "t": "text",
       "v": "When"
      }
     ],
     [
      {
       "t": "text",
       "v": "What the user sees"
      }
     ],
     [
      {
       "t": "text",
       "v": "What to do"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Populated"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Always"
       }
      ],
      [
       {
        "t": "text",
        "v": "Six cards"
       }
      ],
      [
       {
        "t": "text",
        "v": "—"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "In use"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "One card matches your Look"
       }
      ],
      [
       {
        "t": "text",
        "v": "2px accent border, \"In use\""
       }
      ],
      [
       {
        "t": "text",
        "v": "—"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Conflict"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Overlapping earlier edits"
       }
      ],
      [
       {
        "t": "text",
        "v": "The dialog"
       }
      ],
      [
       {
        "t": "text",
        "v": "Choose"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Loading"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Not applicable"
       }
      ],
      [
       {
        "t": "text",
        "v": "Nothing is fetched"
       }
      ],
      [
       {
        "t": "text",
        "v": "—"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Empty"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Cannot occur"
       }
      ],
      [
       {
        "t": "text",
        "v": "Six Looks are compiled in"
       }
      ],
      [
       {
        "t": "text",
        "v": "—"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Error"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Cannot occur"
       }
      ],
      [
       {
        "t": "text",
        "v": "No request can fail"
       }
      ],
      [
       {
        "t": "text",
        "v": "—"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Storage unavailable"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Private browsing, quota"
       }
      ],
      [
       {
        "t": "text",
        "v": "Look applies, does not survive reload"
       }
      ],
      [
       {
        "t": "text",
        "v": "Use a normal window"
       }
      ]
     ]
    ]
   }
  ],
  "audience": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Role"
      }
     ],
     [
      {
       "t": "text",
       "v": "Why they come here"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Admin / Super Admin"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Set the product's appearance for their team"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "User (store operator)"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Pick something readable for their working conditions"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Service Engineer"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Field-readable appearance for outdoor use"
       }
      ]
     ]
    ]
   },
   {
    "type": "quote",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Roles are designed, not enforced."
       }
      ]
     },
     {
      "t": "text",
      "v": " See "
     },
     {
      "t": "text",
      "v": "README"
     },
     {
      "t": "text",
      "v": ". Despite living under "
     },
     {
      "t": "code",
      "v": "/admin/"
     },
     {
      "t": "text",
      "v": ", this screen has no route guard."
     }
    ]
   }
  ],
  "access": [
   {
    "type": "table",
    "head": [
     [],
     []
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Route"
         }
        ]
       }
      ],
      [
       {
        "t": "code",
        "v": "/admin/appearance"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Navigation"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Rail → Administration → Appearance, directly above "
       },
       {
        "t": "i",
        "v": "Design tokens"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Deep link"
         }
        ]
       }
      ],
      [
       {
        "t": "code",
        "v": "/admin/appearance"
       }
      ]
     ]
    ]
   }
  ]
 },
 "/assets/condition": {
  "routes": [
   "/assets/condition"
  ],
  "title": "Assets — Rooftop Condition",
  "summary": [
   {
    "t": "text",
    "v": "The "
   },
   {
    "t": "b",
    "parts": [
     {
      "t": "text",
      "v": "aggregate"
     }
    ]
   },
   {
    "t": "text",
    "v": " physical condition picture a design and procurement team needs — roof age, orientation, structure and earthing runs."
   }
  ],
  "aliases": [
   "asset condition",
   "roof condition",
   "feasibility",
   "design inputs",
   "structure runs",
   "earthing"
  ],
  "related": [
   "/sites",
   "/overview",
   "/reports"
  ],
  "updated": "2026-08-24",
  "doc": "docs/screen-guides/assets-condition.md",
  "useCases": [
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"How much structure and earthing cable will this rollout need?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Mean structure run × sites, mean earthing run × sites. Then apply your own contingency — the means come from nine records."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Are these roofs old enough to need remedial work?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Mean roof age"
       }
      ]
     },
     {
      "t": "text",
      "v": ", then "
     },
     {
      "t": "link",
      "v": "Sites",
      "href": "/sites"
     },
     {
      "t": "text",
      "v": " for the individual records."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Why can't I see per-consumer detail?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Deliberate. §14."
     }
    ]
   }
  ],
  "questions": [
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why is there no per-consumer list here?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Deliberate. The consumer master carries real names and phone numbers, and bundling that PII into a public client build for a demo table was judged not worth it. This screen uses the site-level survey data instead."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. What is the difference between this and Sites?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Sites is the record browser — one row per survey. This is the aggregate condition picture. Same 9 records underneath."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Can I trust the means?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. They are computed correctly from real records — but there are only nine. Treat them as directional."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why does "
       },
       {
        "t": "code",
        "v": "/assets"
       },
       {
        "t": "text",
        "v": " show a different screen?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. "
     },
     {
      "t": "code",
      "v": "/assets"
     },
     {
      "t": "text",
      "v": " is "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Devices"
       }
      ]
     },
     {
      "t": "text",
      "v": "; this is "
     },
     {
      "t": "code",
      "v": "/assets/condition"
     },
     {
      "t": "text",
      "v": ". A known naming trap."
     }
    ]
   }
  ],
  "troubleshooting": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Symptom"
      }
     ],
     [
      {
       "t": "text",
       "v": "Likely cause"
      }
     ],
     [
      {
       "t": "text",
       "v": "What to do"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "text",
        "v": "Empty"
       }
      ],
      [
       {
        "t": "text",
        "v": "No surveys in scope"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected outside SASARAM"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Means look implausible"
       }
      ],
      [
       {
        "t": "text",
        "v": "Nine records"
       }
      ],
      [
       {
        "t": "text",
        "v": "Check "
       },
       {
        "t": "link",
        "v": "Sites",
        "href": "/sites"
       },
       {
        "t": "text",
        "v": " for the individual values"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Wrong screen"
       }
      ],
      [
       {
        "t": "code",
        "v": "/assets"
       },
       {
        "t": "text",
        "v": " vs "
       },
       {
        "t": "code",
        "v": "/assets/condition"
       }
      ],
      [
       {
        "t": "text",
        "v": "Use the full path"
       }
      ]
     ]
    ]
   }
  ],
  "states": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "State"
      }
     ],
     [
      {
       "t": "text",
       "v": "When"
      }
     ],
     [
      {
       "t": "text",
       "v": "What the user sees"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Populated"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Surveys in scope"
       }
      ],
      [
       {
        "t": "text",
        "v": "Aggregates"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Empty"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "No surveys in scope"
       }
      ],
      [
       {
        "t": "text",
        "v": "Empty state — common outside SASARAM"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Small-sample"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Always, today"
       }
      ],
      [
       {
        "t": "text",
        "v": "Real figures over 9 records"
       }
      ]
     ]
    ]
   }
  ],
  "audience": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Role"
      }
     ],
     [
      {
       "t": "text",
       "v": "Why"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Analyst"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Aggregate condition for planning"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Admin / Super Admin"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Procurement and design inputs"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Service Engineer"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "What to expect on site"
       }
      ]
     ]
    ]
   },
   {
    "type": "quote",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Roles are designed, not enforced."
       }
      ]
     },
     {
      "t": "text",
      "v": " See "
     },
     {
      "t": "text",
      "v": "README"
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   }
  ],
  "access": [
   {
    "type": "table",
    "head": [
     [],
     []
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Route"
         }
        ]
       }
      ],
      [
       {
        "t": "code",
        "v": "/assets/condition"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Navigation"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Rail → Assets → Condition"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Not"
         }
        ]
       }
      ],
      [
       {
        "t": "code",
        "v": "/assets"
       },
       {
        "t": "text",
        "v": " — that is the "
       },
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Devices"
         }
        ]
       },
       {
        "t": "text",
        "v": " screen"
       }
      ]
     ]
    ]
   }
  ]
 },
 "/data/health": {
  "routes": [
   "/data/health"
  ],
  "title": "Data — Ingestion Health",
  "summary": [
   {
    "t": "text",
    "v": "Is data arriving, how late is it, and did it parse? "
   },
   {
    "t": "b",
    "parts": [
     {
      "t": "text",
      "v": "Everything here is measured, not configured."
     }
    ]
   }
  ],
  "aliases": [
   "ingestion health",
   "pipeline health",
   "is data arriving",
   "parse errors",
   "latency",
   "lag"
  ],
  "related": [
   "/data/import",
   "/data/history",
   "/telemetry/gti/data",
   "/telemetry/meter"
  ],
  "updated": "2026-08-24",
  "doc": "docs/screen-guides/data-health.md",
  "useCases": [
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Has ingestion stopped?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Per-stream arrival. Where a stream is empty, the reason is stated."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Why is this reading old?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Measured lag, judged against that device's own interval."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"What's our parse success rate?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "The screen refuses to tell you"
       }
      ]
     },
     {
      "t": "text",
      "v": ", because four messages cannot produce a fleet rate. Use the counts. §14."
     }
    ]
   }
  ],
  "questions": [
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. What is ingestion lag exactly?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Gateway payloads carry two independent clocks — the filename is UTC, the payload "
     },
     {
      "t": "code",
      "v": "TIMESTAMP"
     },
     {
      "t": "text",
      "v": " is IST. The gap between them is the lag. They are kept as separate fields for exactly this reason; normalising them would destroy the measurement."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why won't the screen show a parse success rate?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Four messages from two gateways is a sample. A percentage over n=4 would read as a fleet statistic and mislead. The banner says so, and counts are shown instead."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. How does it decide a message is late?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Against the device's "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "own declared "
       },
       {
        "t": "code",
        "v": "STINTERVAL"
       }
      ]
     },
     {
      "t": "text",
      "v": ", not a fixed threshold. A device reporting hourly is not late at 20 minutes."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. A stream shows nothing — is it broken?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Read the reason next to it. \"No messages of this type\" and \"no extract received\" are different problems."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Is this the same as meter clock skew?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. No. Ingestion lag is the gap between the "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "file's"
       }
      ]
     },
     {
      "t": "text",
      "v": " clock and the "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "payload's"
       }
      ]
     },
     {
      "t": "text",
      "v": " clock. Meter clock skew is the "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "meter's own RTC"
       }
      ]
     },
     {
      "t": "text",
      "v": " against the message — see "
     },
     {
      "t": "link",
      "v": "Meter",
      "href": "/telemetry/meter"
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   }
  ],
  "troubleshooting": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Symptom"
      }
     ],
     [
      {
       "t": "text",
       "v": "Likely cause"
      }
     ],
     [
      {
       "t": "text",
       "v": "What to do"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "text",
        "v": "A stream is empty"
       }
      ],
      [
       {
        "t": "text",
        "v": "No messages, or no extract"
       }
      ],
      [
       {
        "t": "text",
        "v": "Read the stated reason"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Lag looks large"
       }
      ],
      [
       {
        "t": "text",
        "v": "Real, measured"
       }
      ],
      [
       {
        "t": "text",
        "v": "Check the gateway's upload path"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "No overall health %"
       }
      ],
      [
       {
        "t": "text",
        "v": "Deliberately refused"
       }
      ],
      [
       {
        "t": "text",
        "v": "Use the counts"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Numbers seem small"
       }
      ],
      [
       {
        "t": "text",
        "v": "Sample is 4 messages"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected"
       }
      ]
     ]
    ]
   }
  ],
  "states": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "State"
      }
     ],
     [
      {
       "t": "text",
       "v": "When"
      }
     ],
     [
      {
       "t": "text",
       "v": "What the user sees"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Sample banner"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Always"
       }
      ],
      [
       {
        "t": "text",
        "v": "The n=4 warning"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Stream present"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Messages exist"
       }
      ],
      [
       {
        "t": "text",
        "v": "Arrival, lag, parse results"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Stream absent"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "No messages"
       }
      ],
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "The reason"
         }
        ]
       },
       {
        "t": "text",
        "v": ", not a blank"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Fleet health"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Always"
       }
      ],
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Refused"
         }
        ]
       },
       {
        "t": "text",
        "v": " — no such figure"
       }
      ]
     ]
    ]
   }
  ],
  "audience": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Role"
      }
     ],
     [
      {
       "t": "text",
       "v": "Why"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Admin / Super Admin"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Is the pipeline working"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Service Engineer"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Which stream stopped, and why"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Analyst"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Whether data is fresh enough to quote"
       }
      ]
     ]
    ]
   },
   {
    "type": "quote",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Roles are designed, not enforced."
       }
      ]
     },
     {
      "t": "text",
      "v": " See "
     },
     {
      "t": "text",
      "v": "README"
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   }
  ],
  "access": [
   {
    "type": "table",
    "head": [
     [],
     []
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Route"
         }
        ]
       }
      ],
      [
       {
        "t": "code",
        "v": "/data/health"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Navigation"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Rail → Data → Health"
       }
      ]
     ]
    ]
   }
  ]
 },
 "/data/history": {
  "routes": [
   "/data/history"
  ],
  "title": "Data — Batch History",
  "summary": [
   {
    "t": "text",
    "v": "The record you check when a number looks wrong: "
   },
   {
    "t": "b",
    "parts": [
     {
      "t": "text",
      "v": "what was loaded, and when"
     }
    ]
   },
   {
    "t": "text",
    "v": "."
   }
  ],
  "aliases": [
   "ingest history",
   "load history",
   "batches",
   "imports",
   "rollback",
   "what was loaded"
  ],
  "related": [
   "/data/import",
   "/data/health"
  ],
  "updated": "2026-08-24",
  "doc": "docs/screen-guides/data-history.md",
  "useCases": [
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"This number looks wrong — which load produced it?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Find the ingest here, then check "
     },
     {
      "t": "link",
      "v": "Ingestion health",
      "href": "/data/health"
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Can we undo the last import?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "No. §14."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Did the survey extract actually arrive?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "It is one of the three rows."
     }
    ]
   }
  ],
  "questions": [
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why can't I roll back an import?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Rollback needs a key to operate on, and "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "no source row carries a batch id"
       }
      ]
     },
     {
      "t": "text",
      "v": ". The consumer master's only provenance is a "
     },
     {
      "t": "code",
      "v": "Created On"
     },
     {
      "t": "text",
      "v": " stamp; the surveys carry a per-row submission time and nothing tying them into a load. The column states that rather than offering a disabled button that would imply the feature exists and is switched off."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why does the consumer master row mention eight loads?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Its own "
     },
     {
      "t": "code",
      "v": "Created On"
     },
     {
      "t": "text",
      "v": " values say it arrived in eight batches on one day, and we hold only the last stamp. It is one logical extract made of eight physical loads we cannot separate, so it is shown that way rather than flattened to one."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Only three ingests — is the history truncated?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. No. Three have happened. A list padded to look busy would defeat the screen's purpose."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. How do I get rollback?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. The source data must carry an "
     },
     {
      "t": "code",
      "v": "import_batch_id"
     },
     {
      "t": "text",
      "v": ". Until then there is nothing to roll back by."
     }
    ]
   }
  ],
  "troubleshooting": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Symptom"
      }
     ],
     [
      {
       "t": "text",
       "v": "Likely cause"
      }
     ],
     [
      {
       "t": "text",
       "v": "What to do"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "text",
        "v": "No rollback button"
       }
      ],
      [
       {
        "t": "text",
        "v": "No batch id exists"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Only three rows"
       }
      ],
      [
       {
        "t": "text",
        "v": "Three ingests"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Cannot trace a figure to one load"
       }
      ],
      [
       {
        "t": "text",
        "v": "Consumer master is 8 loads under one row"
       }
      ],
      [
       {
        "t": "text",
        "v": "Known limit"
       }
      ]
     ]
    ]
   }
  ],
  "states": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "State"
      }
     ],
     [
      {
       "t": "text",
       "v": "When"
      }
     ],
     [
      {
       "t": "text",
       "v": "What the user sees"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Populated"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Always"
       }
      ],
      [
       {
        "t": "text",
        "v": "Three ingests"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Rollback unavailable"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Always"
       }
      ],
      [
       {
        "t": "text",
        "v": "The column states why"
       }
      ]
     ]
    ]
   }
  ],
  "audience": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Role"
      }
     ],
     [
      {
       "t": "text",
       "v": "Why"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Admin / Super Admin"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "What has been loaded"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Analyst"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Provenance for a figure they are about to quote"
       }
      ]
     ]
    ]
   },
   {
    "type": "quote",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Roles are designed, not enforced."
       }
      ]
     },
     {
      "t": "text",
      "v": " See "
     },
     {
      "t": "text",
      "v": "README"
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   }
  ],
  "access": [
   {
    "type": "table",
    "head": [
     [],
     []
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Route"
         }
        ]
       }
      ],
      [
       {
        "t": "code",
        "v": "/data/history"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Navigation"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Rail → Data → History"
       }
      ]
     ]
    ]
   }
  ]
 },
 "/data/import": {
  "routes": [
   "/data/import"
  ],
  "title": "Data — Import",
  "summary": [
   {
    "t": "text",
    "v": "Check a file "
   },
   {
    "t": "b",
    "parts": [
     {
      "t": "text",
      "v": "before"
     }
    ]
   },
   {
    "t": "text",
    "v": " it is loaded. The dry run is real — it parses the bytes you chose, in your browser."
   }
  ],
  "aliases": [
   "upload",
   "import data",
   "load file",
   "csv upload",
   "dry run",
   "validation"
  ],
  "related": [
   "/data/history",
   "/data/health"
  ],
  "updated": "2026-08-24",
  "doc": "docs/screen-guides/data-import.md",
  "useCases": [
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Does this extract match what the platform expects?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Choose the file → read the findings. Empty means it matched."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"The supplier's file keeps failing.\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Send them the "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Expected schema"
       }
      ]
     },
     {
      "t": "text",
      "v": " card."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Can I load this into the platform?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Not from here. Validate, then hand it over. §8."
     }
    ]
   }
  ],
  "questions": [
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Is my file uploaded anywhere?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. No. It is parsed in your browser and never leaves your machine."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why can't I commit?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Commit is not built — there is nowhere to commit to. The screen says this explicitly rather than showing a greyed-out button, because a greyed button would imply a permissions problem."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Is the validation real or a demo?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Real. It parses the actual bytes of the file you chose."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why validate before loading rather than after?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. The consumer master arrived as 9,673 rows in one load. Finding a malformed date afterwards would mean unpicking it "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "with no batch id to unpick by"
       }
      ]
     },
     {
      "t": "text",
      "v": " — the gap documented on "
     },
     {
      "t": "link",
      "v": "Batch history",
      "href": "/data/history"
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. What file formats are accepted?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. — not verified for this guide. The Expected schema card states what is required."
     }
    ]
   }
  ],
  "troubleshooting": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Symptom"
      }
     ],
     [
      {
       "t": "text",
       "v": "Likely cause"
      }
     ],
     [
      {
       "t": "text",
       "v": "What to do"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "text",
        "v": "No Commit button"
       }
      ],
      [
       {
        "t": "text",
        "v": "Not built"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Findings on a file that \"works elsewhere\""
       }
      ],
      [
       {
        "t": "text",
        "v": "Different expected schema"
       }
      ],
      [
       {
        "t": "text",
        "v": "Compare with the Expected schema card"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Findings vanished"
       }
      ],
      [
       {
        "t": "text",
        "v": "Nothing is persisted"
       }
      ],
      [
       {
        "t": "text",
        "v": "Re-select the file"
       }
      ]
     ]
    ]
   }
  ],
  "states": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "State"
      }
     ],
     [
      {
       "t": "text",
       "v": "When"
      }
     ],
     [
      {
       "t": "text",
       "v": "What the user sees"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Initial"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "No file chosen"
       }
      ],
      [
       {
        "t": "text",
        "v": "The chooser and the schema"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Findings"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "File parsed with problems"
       }
      ],
      [
       {
        "t": "text",
        "v": "The findings table"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Clean"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "File matched"
       }
      ],
      [
       {
        "t": "text",
        "v": "No findings"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Commit unavailable"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Always"
       }
      ],
      [
       {
        "t": "text",
        "v": "The explanatory notice"
       }
      ]
     ]
    ]
   }
  ],
  "audience": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Role"
      }
     ],
     [
      {
       "t": "text",
       "v": "Why"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Admin / Super Admin"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Validate an extract before it is loaded"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Analyst"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Confirm a file's shape"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Service Engineer"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Check a field export parses"
       }
      ]
     ]
    ]
   },
   {
    "type": "quote",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Roles are designed, not enforced."
       }
      ]
     },
     {
      "t": "text",
      "v": " See "
     },
     {
      "t": "text",
      "v": "README"
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   }
  ],
  "access": [
   {
    "type": "table",
    "head": [
     [],
     []
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Route"
         }
        ]
       }
      ],
      [
       {
        "t": "code",
        "v": "/data/import"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Navigation"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Rail → Data → Import"
       }
      ]
     ]
    ]
   }
  ]
 },
 "/admin/design-tokens": {
  "routes": [
   "/admin/design-tokens"
  ],
  "title": "Administration — Design Tokens",
  "summary": [
   {
    "t": "text",
    "v": "The expert tool. "
   },
   {
    "t": "b",
    "parts": [
     {
      "t": "text",
      "v": "Every token in the product, editable live"
     }
    ]
   },
   {
    "t": "text",
    "v": " — and every edit repaints the product immediately."
   }
  ],
  "aliases": [
   "token editor",
   "theme editor",
   "colours",
   "design system",
   "fine-tune the design",
   "styling"
  ],
  "related": [
   "/admin/appearance",
   "/gallery"
  ],
  "updated": "2026-08-24",
  "doc": "docs/screen-guides/design-tokens.md",
  "useCases": [
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Change one specific colour.\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Semantic roles → edit → watch the audit."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Why is this text hard to read?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Audit"
       }
      ]
     },
     {
      "t": "text",
      "v": " tab — it names the pair and the shortfall."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Make the whole product look different.\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Wrong screen. Use "
     },
     {
      "t": "link",
      "v": "Appearance",
      "href": "/admin/appearance"
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Land my change permanently.\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Export → merge into "
     },
     {
      "t": "code",
      "v": "figma-tokens.json"
     },
     {
      "t": "text",
      "v": " → "
     },
     {
      "t": "code",
      "v": "npm run tokens"
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   }
  ],
  "questions": [
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Does editing here change the real product?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. It repaints your browser immediately, but "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "nothing is written to disk"
       }
      ]
     },
     {
      "t": "text",
      "v": ". To land it: Export → merge into "
     },
     {
      "t": "code",
      "v": "figma-tokens.json"
     },
     {
      "t": "text",
      "v": " → "
     },
     {
      "t": "code",
      "v": "npm run tokens"
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Is the preview accurate?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. It is not a preview — it "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "is"
       }
      ]
     },
     {
      "t": "text",
      "v": " the build output. The editor resolves through the same function the build uses."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Can the editor say something passes that CI then rejects?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. No. Same contract, same maths. An editor laxer than CI would be worse than none."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. What is the difference between this and Appearance?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Appearance offers six complete, pre-checked appearances. This edits individual tokens and assumes you know which colours must contrast with which."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. What are the 134 known defects?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Pre-existing contrast shortfalls, tracked so the count can only go down."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Can I undo?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Yes — at the scope the mistake happened at: one slot, one state, one variant, one component, one tier, or the whole draft."
     }
    ]
   }
  ],
  "troubleshooting": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Symptom"
      }
     ],
     [
      {
       "t": "text",
       "v": "Likely cause"
      }
     ],
     [
      {
       "t": "text",
       "v": "What to do"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "text",
        "v": "Change vanished on another machine"
       }
      ],
      [
       {
        "t": "text",
        "v": "Draft is per-browser"
       }
      ],
      [
       {
        "t": "text",
        "v": "Export and merge"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Audit shows failures"
       }
      ],
      [
       {
        "t": "text",
        "v": "Your edit broke a pair"
       }
      ],
      [
       {
        "t": "text",
        "v": "Read the pair; undo"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "A Look ignores my edit"
       }
      ],
      [
       {
        "t": "text",
        "v": "Overrides win over Looks"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected — see "
       },
       {
        "t": "text",
        "v": "Appearance"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Edited "
       },
       {
        "t": "code",
        "v": "tokens.css"
       },
       {
        "t": "text",
        "v": " and nothing happened"
       }
      ],
      [
       {
        "t": "text",
        "v": "It is generated"
       }
      ],
      [
       {
        "t": "text",
        "v": "Edit the source and regenerate"
       }
      ]
     ]
    ]
   }
  ],
  "states": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "State"
      }
     ],
     [
      {
       "t": "text",
       "v": "When"
      }
     ],
     [
      {
       "t": "text",
       "v": "What the user sees"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Clean"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "No draft"
       }
      ],
      [
       {
        "t": "text",
        "v": "Shipped values"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Draft"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "After editing"
       }
      ],
      [
       {
        "t": "text",
        "v": "Change count in the draft bar"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Audit failing"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "An edit breaks a pair"
       }
      ],
      [
       {
        "t": "text",
        "v": "The pair and the shortfall"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Known defects"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Always"
       }
      ],
      [
       {
        "t": "text",
        "v": "134 pre-existing, tracked"
       }
      ]
     ]
    ]
   }
  ],
  "audience": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Role"
      }
     ],
     [
      {
       "t": "text",
       "v": "Why"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Designer / design-system owner"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Author and audit tokens"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Developer"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Inspect what a component resolves to"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Admin / Super Admin"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Rarely — Appearance is the right tool"
       }
      ]
     ]
    ]
   },
   {
    "type": "quote",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Roles are designed, not enforced."
       }
      ]
     },
     {
      "t": "text",
      "v": " See "
     },
     {
      "t": "text",
      "v": "README"
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   }
  ],
  "access": [
   {
    "type": "table",
    "head": [
     [],
     []
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Route"
         }
        ]
       }
      ],
      [
       {
        "t": "code",
        "v": "/admin/design-tokens"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Navigation"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Rail → Administration → Design tokens"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Also from"
         }
        ]
       }
      ],
      [
       {
        "t": "link",
        "v": "Appearance",
        "href": "/admin/appearance"
       },
       {
        "t": "text",
        "v": " → "
       },
       {
        "t": "i",
        "v": "Fine-tune the design"
       }
      ]
     ]
    ]
   }
  ]
 },
 "/assets": {
  "routes": [
   "/assets"
  ],
  "title": "Devices",
  "summary": [
   {
    "t": "text",
    "v": "Every registered device in the selected area, and — the point of the screen — whether its "
   },
   {
    "t": "b",
    "parts": [
     {
      "t": "text",
      "v": "nameplate is complete enough for its telemetry to be judged at all"
     }
    ]
   },
   {
    "t": "text",
    "v": "."
   }
  ],
  "aliases": [
   "device registry",
   "assets",
   "equipment list",
   "device list",
   "inverters",
   "gateways"
  ],
  "related": [
   "/assets/condition",
   "/telemetry/gti/data",
   "/telemetry/bms",
   "/telemetry/ups",
   "/telemetry/meter",
   "/data/health"
  ],
  "updated": "2026-08-24",
  "doc": "docs/screen-guides/devices.md",
  "useCases": [
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Which devices are missing their specs?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Sort by "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Nameplate"
       }
      ]
     },
     {
      "t": "text",
      "v": " ascending. Anything below 100 % is missing something; ⋮ → "
     },
     {
      "t": "i",
      "v": "View raw record"
     },
     {
      "t": "text",
      "v": " shows which fields."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Has this device stopped reporting?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Search its number → read "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Reporting"
       }
      ]
     },
     {
      "t": "text",
      "v": ". "
     },
     {
      "t": "code",
      "v": "Stale"
     },
     {
      "t": "text",
      "v": " means overdue by more than three of its own intervals; "
     },
     {
      "t": "code",
      "v": "Never"
     },
     {
      "t": "text",
      "v": " means it has not reported at all."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Why does this device's yield show as unknown elsewhere?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Usually "
     },
     {
      "t": "code",
      "v": "rated_kw"
     },
     {
      "t": "text",
      "v": " is missing — visible here as a nameplate below 100 %. Specific yield is kWh ÷ kWp and cannot be computed without the rating."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Find the device for consumer 1140028871.\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Type the consumer number into search — it matches consumer reference as well as device number."
     }
    ]
   }
  ],
  "questions": [
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why does this device show 50 % nameplate?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. It is a GTI gateway, which expects six fields. The meter half arrives with every data frame; the gateway half arrives empty in the heartbeat; and "
     },
     {
      "t": "code",
      "v": "rated_kw"
     },
     {
      "t": "text",
      "v": " is in no payload at all. Three of six is 50 %."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. What is the difference between "
       },
       {
        "t": "code",
        "v": "Stale"
       },
       {
        "t": "text",
        "v": " and "
       },
       {
        "t": "code",
        "v": "Never"
       },
       {
        "t": "text",
        "v": "?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. "
     },
     {
      "t": "code",
      "v": "Stale"
     },
     {
      "t": "text",
      "v": " means it reported once and is now overdue by more than three of its own intervals. "
     },
     {
      "t": "code",
      "v": "Never"
     },
     {
      "t": "text",
      "v": " means it has never reported. A device that never reported is not a device that stopped."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why can't I click "
       },
       {
        "t": "i",
        "v": "Edit nameplate"
       },
       {
        "t": "text",
        "v": "?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. It is unimplemented — not a permission problem. There is no write path in the application yet."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why are there only two devices?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. That is what the current extract contains. The source DMS holds 151."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why does this say "
       },
       {
        "t": "code",
        "v": "No schema"
       },
       {
        "t": "text",
        "v": "?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. That device's class declares no expected nameplate fields, so completeness is unmeasurable. That is different from 0 % — which would mean "
     },
     {
      "t": "i",
      "v": "we checked and found nothing"
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Where is the consumer's name?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Deliberately absent. This screen shows the consumer "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "number"
       }
      ]
     },
     {
      "t": "text",
      "v": " only; the source DMS screen leads with name, mobile and email, and bundling those into a client build was refused."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Is "
       },
       {
        "t": "code",
        "v": "Reporting"
       },
       {
        "t": "text",
        "v": " trustworthy for UPS and BMS?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Less so. Their 15-minute intervals are marked "
     },
     {
      "t": "code",
      "v": "[seed]"
     },
     {
      "t": "text",
      "v": " — no UPS or BMS payload has been observed, so the interval is an assumption, and a wrong interval reclassifies a healthy device as stale."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why is "
       },
       {
        "t": "code",
        "v": "meter"
       },
       {
        "t": "text",
        "v": " missing from the class filter?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. The dropdown offers UPS, BMS and GTI only, though "
     },
     {
      "t": "code",
      "v": "meter"
     },
     {
      "t": "text",
      "v": " exists in the domain model. Appears to be an oversight. for the absence, for the reason."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Is this live?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. No — bundled at build time, cached 30 seconds, no refetch on focus."
     }
    ]
   }
  ],
  "troubleshooting": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Symptom"
      }
     ],
     [
      {
       "t": "text",
       "v": "Likely cause"
      }
     ],
     [
      {
       "t": "text",
       "v": "What to do"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "text",
        "v": "\"Registry not yet ingested\""
       }
      ],
      [
       {
        "t": "text",
        "v": "No devices in scope, or no extract"
       }
      ],
      [
       {
        "t": "text",
        "v": "Widen scope. Otherwise expected"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Nameplate below 100 % everywhere"
       }
      ],
      [
       {
        "t": "text",
        "v": "Payloads genuinely omit fields"
       }
      ],
      [
       {
        "t": "text",
        "v": "⋮ → View raw record to see which"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Everything reads "
       },
       {
        "t": "code",
        "v": "Stale"
       }
      ],
      [
       {
        "t": "text",
        "v": "Extract is older than the intervals"
       }
      ],
      [
       {
        "t": "text",
        "v": "Check "
       },
       {
        "t": "i",
        "v": "Last reading"
       },
       {
        "t": "text",
        "v": " — the extract is a snapshot"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Filter finds nothing"
       }
      ],
      [
       {
        "t": "text",
        "v": "Search matches numbers only"
       }
      ],
      [
       {
        "t": "text",
        "v": "Search by device or consumer number"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "A meter device will not filter"
       }
      ],
      [
       {
        "t": "text",
        "v": "No "
       },
       {
        "t": "code",
        "v": "meter"
       },
       {
        "t": "text",
        "v": " option in the dropdown"
       }
      ],
      [
       {
        "t": "text",
        "v": "Use search instead"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Error with a reference id"
       }
      ],
      [
       {
        "t": "text",
        "v": "A query failed"
       }
      ],
      [
       {
        "t": "text",
        "v": "Quote the reference id — it is the request id"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Count disagrees with the DMS"
       }
      ],
      [
       {
        "t": "text",
        "v": "Different sources"
       }
      ],
      [
       {
        "t": "text",
        "v": "The DMS holds 151; this shows the extract"
       }
      ]
     ]
    ]
   }
  ],
  "states": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "State"
      }
     ],
     [
      {
       "t": "text",
       "v": "When"
      }
     ],
     [
      {
       "t": "text",
       "v": "What the user sees"
      }
     ],
     [
      {
       "t": "text",
       "v": "What to do"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Loading"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Briefly, on scope change"
       }
      ],
      [
       {
        "t": "text",
        "v": "Spinner + \"Loading…\""
       }
      ],
      [
       {
        "t": "text",
        "v": "Wait. The mock adds 120–400 ms of deliberate latency"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Populated"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Devices in scope"
       }
      ],
      [
       {
        "t": "text",
        "v": "The table"
       }
      ],
      [
       {
        "t": "text",
        "v": "—"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "No results"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Filter or search matches nothing"
       }
      ],
      [
       {
        "t": "i",
        "v": "No devices match these filters"
       }
      ],
      [
       {
        "t": "text",
        "v": "Clear the search or change class"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Empty"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "No devices in scope at all"
       }
      ],
      [
       {
        "t": "i",
        "v": "Registry not yet ingested"
       },
       {
        "t": "text",
        "v": " + the reason"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected — see §14"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Error"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "A query fails"
       }
      ],
      [
       {
        "t": "text",
        "v": "Message, "
       },
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Try again"
         }
        ]
       },
       {
        "t": "text",
        "v": ", and a reference id"
       }
      ],
      [
       {
        "t": "text",
        "v": "Quote the reference id to support"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Partial"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Devices present, nameplates incomplete"
       }
      ],
      [
       {
        "t": "text",
        "v": "Percentages below 100 %"
       }
      ],
      [
       {
        "t": "text",
        "v": "That is the screen working, not failing"
       }
      ]
     ]
    ]
   }
  ],
  "audience": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Role"
      }
     ],
     [
      {
       "t": "text",
       "v": "Why they come here"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Service Engineer"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Which devices are stale or missing nameplate data"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Admin / Super Admin"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Registry completeness across the fleet"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Analyst"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Whether telemetry can be judged before quoting a figure"
       }
      ]
     ]
    ]
   },
   {
    "type": "quote",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Roles are designed, not enforced."
       }
      ]
     },
     {
      "t": "text",
      "v": " See "
     },
     {
      "t": "text",
      "v": "README"
     },
     {
      "t": "text",
      "v": ". No route guard exists; anyone who can open the app can open this screen."
     }
    ]
   }
  ],
  "access": [
   {
    "type": "table",
    "head": [
     [],
     []
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Route"
         }
        ]
       }
      ],
      [
       {
        "t": "code",
        "v": "/assets"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Navigation"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Rail → Assets"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Deep link"
         }
        ]
       }
      ],
      [
       {
        "t": "code",
        "v": "/assets"
       },
       {
        "t": "text",
        "v": ". Scope, class filter and search are "
       },
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "not"
         }
        ]
       },
       {
        "t": "text",
        "v": " in the URL, so a shared link does not carry them"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Not"
         }
        ]
       }
      ],
      [
       {
        "t": "code",
        "v": "/devices"
       },
       {
        "t": "text",
        "v": " — no such route"
       }
      ]
     ]
    ]
   }
  ]
 },
 "/gallery": {
  "routes": [
   "/gallery"
  ],
  "title": "Component Gallery",
  "summary": [
   {
    "t": "text",
    "v": "Every component in every state, on one page. "
   },
   {
    "t": "b",
    "parts": [
     {
      "t": "text",
      "v": "There is no test suite; this page is the substitute."
     }
    ]
   }
  ],
  "aliases": [
   "gallery",
   "component showcase",
   "style guide",
   "storybook",
   "all components",
   "test page"
  ],
  "related": [
   "/admin/design-tokens",
   "/admin/appearance"
  ],
  "updated": "2026-08-24",
  "doc": "docs/screen-guides/gallery.md",
  "useCases": [
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Does this Look work everywhere?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Apply it on "
     },
     {
      "t": "link",
      "v": "Appearance",
      "href": "/admin/appearance"
     },
     {
      "t": "text",
      "v": ", then come here."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Check dark mode and RTL.\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Switch mode or direction and scan the page — that is what it is for."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"What states does this component have?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Find its section."
     }
    ]
   }
  ],
  "questions": [
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Is this a real screen or a test page?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. A verification page. There is no test suite; this is the substitute."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Can I trust the numbers here?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. They are real — imported from the same source Overview uses, precisely so the gallery cannot drift. But read figures on the screen that owns them."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why does it use real survey rows?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. An earlier hand-typed draft got "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "5 of 9 verdicts wrong"
       }
      ]
     },
     {
      "t": "text",
      "v": ". Importing removed the possibility."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. How do I check dark mode?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Switch mode; every example repaints."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Should this page be visible to end users?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. — an open question."
     }
    ]
   }
  ],
  "troubleshooting": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Symptom"
      }
     ],
     [
      {
       "t": "text",
       "v": "Likely cause"
      }
     ],
     [
      {
       "t": "text",
       "v": "What to do"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "text",
        "v": "A component looks wrong here"
       }
      ],
      [
       {
        "t": "text",
        "v": "Likely wrong everywhere"
       }
      ],
      [
       {
        "t": "text",
        "v": "Check "
       },
       {
        "t": "link",
        "v": "Design tokens",
        "href": "/admin/design-tokens"
       },
       {
        "t": "text",
        "v": " audit"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "A component is missing"
       }
      ],
      [
       {
        "t": "text",
        "v": "Gallery not updated"
       }
      ],
      [
       {
        "t": "text",
        "v": "Add it — the page is expected to stay current"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Numbers differ from Overview"
       }
      ],
      [
       {
        "t": "text",
        "v": "They should not"
       }
      ],
      [
       {
        "t": "text",
        "v": "Report it — same source"
       }
      ]
     ]
    ]
   }
  ],
  "states": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "State"
      }
     ],
     [
      {
       "t": "text",
       "v": "When"
      }
     ],
     [
      {
       "t": "text",
       "v": "What the user sees"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Populated"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Always"
       }
      ],
      [
       {
        "t": "text",
        "v": "Every component"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Reflects current theme"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Always"
       }
      ],
      [
       {
        "t": "text",
        "v": "Whatever Look, scheme and mode you have"
       }
      ]
     ]
    ]
   }
  ],
  "audience": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Role"
      }
     ],
     [
      {
       "t": "text",
       "v": "Why"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Designer / developer"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Verify every component in every state"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Admin / Super Admin"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "See what a Look does everywhere at once"
       }
      ]
     ]
    ]
   },
   {
    "type": "quote",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Roles are designed, not enforced."
       }
      ]
     },
     {
      "t": "text",
      "v": " See "
     },
     {
      "t": "text",
      "v": "README"
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   }
  ],
  "access": [
   {
    "type": "table",
    "head": [
     [],
     []
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Route"
         }
        ]
       }
      ],
      [
       {
        "t": "code",
        "v": "/gallery"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Navigation"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "— whether it appears in the rail is not verified. Reachable by URL"
       }
      ]
     ]
    ]
   }
  ]
 },
 "/overview": {
  "routes": [
   "/overview"
  ],
  "title": "Programme Overview",
  "summary": [
   {
    "t": "text",
    "v": "Where the rooftop-solar rollout stands "
   },
   {
    "t": "b",
    "parts": [
     {
      "t": "text",
      "v": "for the area you have selected"
     }
    ]
   },
   {
    "t": "text",
    "v": " — how many consumers are registered, how many have been surveyed, and what is blocking the rest."
   }
  ],
  "aliases": [
   "dashboard",
   "home",
   "landing page",
   "programme dashboard",
   "main screen"
  ],
  "related": [
   "/sites",
   "/assets",
   "/alarms",
   "/reports"
  ],
  "updated": "2026-08-24",
  "doc": "docs/screen-guides/overview.md",
  "useCases": [
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"How far along is my circle?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Set scope to the circle → read "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Coverage"
       }
      ]
     },
     {
      "t": "text",
      "v": ". "
     },
     {
      "t": "code",
      "v": "unknown"
     },
     {
      "t": "text",
      "v": " means the registered count is zero for that branch, not that nothing has been done."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Which area should we send surveyors to next?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "i",
      "v": "Registered by area"
     },
     {
      "t": "text",
      "v": " → the tallest bars with the fewest submissions."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"How many problems are open?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Open exceptions"
       }
      ]
     },
     {
      "t": "text",
      "v": " tile, then "
     },
     {
      "t": "link",
      "v": "Alarms",
      "href": "/alarms"
     },
     {
      "t": "text",
      "v": " for the detail."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Why does my area show 0 registered?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "See §14 — almost certainly the JAMUI/SASARAM non-overlap."
     }
    ]
   }
  ],
  "questions": [
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why does Coverage say "
       },
       {
        "t": "code",
        "v": "unknown"
       },
       {
        "t": "text",
        "v": " instead of a percentage?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. The registered count for your scope is zero, so surveyed ÷ registered has no answer. The screen refuses to print "
     },
     {
      "t": "code",
      "v": "0%"
     },
     {
      "t": "text",
      "v": ", because that would read as \"nobody has been surveyed\" when the truth is \"we cannot tell\"."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why is Registered zero for my area?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. The two source extracts do not overlap. The consumer master covers "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "JAMUI"
       }
      ]
     },
     {
      "t": "text",
      "v": "; the site survey covers "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "SASARAM / Kaimur"
       }
      ]
     },
     {
      "t": "text",
      "v": ". Every SASARAM leaf carries "
     },
     {
      "t": "code",
      "v": "registered: 0"
     },
     {
      "t": "text",
      "v": " because those consumers are not in the master file. This is a property of the source data, not a defect, and it is deliberately surfaced rather than hidden."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why are all the device tiles zero?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. The device arrays in "
     },
     {
      "t": "code",
      "v": "src/lib/device-data.js"
     },
     {
      "t": "text",
      "v": " are "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "empty on purpose"
       }
      ]
     },
     {
      "t": "text",
      "v": ". The source DMS holds this data — 151 devices, 44 BMS readings, 42 UPS readings, one GTI device across four message streams — and a real extract is what fills them. Until it arrives, every screen built on that module renders its honest empty state rather than plausible-looking invented numbers."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Is this real-time?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. No. Every figure is computed in the browser from files bundled at build time."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why only 9 surveys?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. That is how many rows "
     },
     {
      "t": "code",
      "v": "Solar PV Site Survey.csv"
     },
     {
      "t": "text",
      "v": " contains. They are transcribed field for field."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Where does \"Needs revisit\" come from?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Surveys whose answers contradict each other — recorded as "
     },
     {
      "t": "i",
      "v": "Rooftop Available? = No"
     },
     {
      "t": "text",
      "v": " while roof structure and ladder access were also recorded."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Can I change anything here?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. No. Read-only."
     }
    ]
   }
  ],
  "troubleshooting": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Symptom"
      }
     ],
     [
      {
       "t": "text",
       "v": "Likely cause"
      }
     ],
     [
      {
       "t": "text",
       "v": "What to do"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "text",
        "v": "Coverage shows "
       },
       {
        "t": "code",
        "v": "unknown"
       }
      ],
      [
       {
        "t": "text",
        "v": "Registered is 0 for this scope"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected. Select a JAMUI-branch area"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "All device figures are 0"
       }
      ],
      [
       {
        "t": "text",
        "v": "DMS extract not yet received"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected. Nothing to fix"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Numbers differ from the DMS"
       }
      ],
      [
       {
        "t": "text",
        "v": "Different sources; this uses the two CSV extracts"
       }
      ],
      [
       {
        "t": "text",
        "v": "Compare against the extracts, not the DMS"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "A figure never updates"
       }
      ],
      [
       {
        "t": "text",
        "v": "Data is bundled at build time"
       }
      ],
      [
       {
        "t": "text",
        "v": "A new extract needs an import and a rebuild"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Shared link shows different numbers"
       }
      ],
      [
       {
        "t": "text",
        "v": "Scope is not in the URL"
       }
      ],
      [
       {
        "t": "text",
        "v": "Tell the recipient which area to select"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "\"Only 9 surveys?\""
       }
      ],
      [
       {
        "t": "text",
        "v": "That is the whole extract"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected"
       }
      ]
     ]
    ]
   }
  ],
  "states": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "State"
      }
     ],
     [
      {
       "t": "text",
       "v": "When"
      }
     ],
     [
      {
       "t": "text",
       "v": "What the user sees"
      }
     ],
     [
      {
       "t": "text",
       "v": "What to do"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Populated"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Scope has consumers and surveys"
       }
      ],
      [
       {
        "t": "text",
        "v": "Figures throughout"
       }
      ],
      [
       {
        "t": "text",
        "v": "—"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Zero registered"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Scope is in the SASARAM branch"
       }
      ],
      [
       {
        "t": "code",
        "v": "0"
       },
       {
        "t": "text",
        "v": " registered, "
       },
       {
        "t": "code",
        "v": "unknown"
       },
       {
        "t": "text",
        "v": " coverage"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected. §14"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "No surveys in scope"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "No survey rows under the node"
       }
      ],
      [
       {
        "t": "code",
        "v": "No surveys in scope"
       },
       {
        "t": "text",
        "v": " freshness"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Device tiles empty"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Always, today"
       }
      ],
      [
       {
        "t": "text",
        "v": "Zero / empty"
       }
      ],
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Expected by design. §14"
         }
        ]
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Loading"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Not applicable"
       }
      ],
      [
       {
        "t": "text",
        "v": "Data is bundled, not fetched"
       }
      ],
      [
       {
        "t": "text",
        "v": "—"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Error"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Not applicable"
       }
      ],
      [
       {
        "t": "text",
        "v": "No request can fail"
       }
      ],
      [
       {
        "t": "text",
        "v": "—"
       }
      ]
     ]
    ]
   }
  ],
  "audience": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Role"
      }
     ],
     [
      {
       "t": "text",
       "v": "Why they come here"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Admin / Super Admin"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Programme-wide progress and where it is stalled"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Analyst"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "The figures that feed reporting"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Service Engineer"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Which areas have open exceptions"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "User (store operator)"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Whether their area's surveys have landed"
       }
      ]
     ]
    ]
   },
   {
    "type": "quote",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Roles are designed, not enforced."
       }
      ]
     },
     {
      "t": "text",
      "v": " "
     },
     {
      "t": "code",
      "v": "src/lib/rbac.js"
     },
     {
      "t": "text",
      "v": " defines these five roles and a permission matrix, and it is imported only by "
     },
     {
      "t": "code",
      "v": "/admin/roles"
     },
     {
      "t": "text",
      "v": " and "
     },
     {
      "t": "code",
      "v": "/admin/users"
     },
     {
      "t": "text",
      "v": ", which display and edit it. There are no route guards anywhere in the application. Anyone who can open the app can open this screen. Treat this table as "
     },
     {
      "t": "i",
      "v": "intended"
     },
     {
      "t": "text",
      "v": " audience, never as access control."
     }
    ]
   }
  ],
  "access": [
   {
    "type": "table",
    "head": [
     [],
     []
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Route"
         }
        ]
       }
      ],
      [
       {
        "t": "code",
        "v": "/overview"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Navigation"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "First item in the left rail"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Deep link"
         }
        ]
       }
      ],
      [
       {
        "t": "code",
        "v": "/overview"
       },
       {
        "t": "text",
        "v": " — the scope is "
       },
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "not"
         }
        ]
       },
       {
        "t": "text",
        "v": " in the URL, so a link opens with the recipient's own scope, not yours"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Landing screen?"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Yes. Any unknown route redirects here — "
       },
       {
        "t": "code",
        "v": "<Route path=\"*\" element={<Navigate to=\"/overview\" replace />} />"
       }
      ]
     ]
    ]
   }
  ]
 },
 "/account/profile": {
  "routes": [
   "/account/profile",
   "/account/support"
  ],
  "title": "Placeholder Routes — Profile & Support",
  "summary": [
   {
    "t": "text",
    "v": "Two nav destinations that resolve to a real screen explaining "
   },
   {
    "t": "b",
    "parts": [
     {
      "t": "text",
      "v": "what specifically is missing"
     }
    ]
   },
   {
    "t": "text",
    "v": " — not \"coming soon\"."
   }
  ],
  "aliases": [
   "profile",
   "my account",
   "support tickets",
   "not built",
   "coming soon",
   "empty screens"
  ],
  "related": [
   "/admin/users",
   "/overview"
  ],
  "updated": "2026-08-24",
  "doc": "docs/screen-guides/placeholder-routes.md",
  "useCases": [
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Where are my profile settings?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "There is no auth layer, so there is no profile to show. Appearance preferences live on "
     },
     {
      "t": "link",
      "v": "Appearance",
      "href": "/admin/appearance"
     },
     {
      "t": "text",
      "v": " and are stored per browser."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"How do I raise a support ticket?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Not in this product. Use your existing support channel."
     }
    ]
   }
  ],
  "questions": [
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why is this screen empty?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. It is not empty — it explains what specifically blocks the screen. Profile needs an auth layer that does not exist; support tickets are an object that appears in no payload."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why does the nav link to a screen that does nothing?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. So the rail is never a set of dead links. Every destination resolves to a real route."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. When will these be built?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. — not recorded. Each is waiting on something specific, not on effort."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Where do I change my settings then?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. "
     },
     {
      "t": "link",
      "v": "Appearance",
      "href": "/admin/appearance"
     },
     {
      "t": "text",
      "v": " for how the product looks — stored in your browser. There is no user profile."
     }
    ]
   }
  ],
  "troubleshooting": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Symptom"
      }
     ],
     [
      {
       "t": "text",
       "v": "Likely cause"
      }
     ],
     [
      {
       "t": "text",
       "v": "What to do"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "text",
        "v": "Nothing on Profile"
       }
      ],
      [
       {
        "t": "text",
        "v": "No auth layer"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "No support ticketing"
       }
      ],
      [
       {
        "t": "text",
        "v": "No such object exists"
       }
      ],
      [
       {
        "t": "text",
        "v": "Use your existing channel"
       }
      ]
     ]
    ]
   }
  ],
  "states": [
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "One state: the explanation."
     }
    ]
   }
  ],
  "audience": [
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Anyone who clicks the nav item."
     }
    ]
   },
   {
    "type": "quote",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Roles are designed, not enforced."
       }
      ]
     },
     {
      "t": "text",
      "v": " See "
     },
     {
      "t": "text",
      "v": "README"
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   }
  ],
  "access": [
   {
    "type": "table",
    "head": [
     [],
     []
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Routes"
         }
        ]
       }
      ],
      [
       {
        "t": "code",
        "v": "/account/profile"
       },
       {
        "t": "text",
        "v": " · "
       },
       {
        "t": "code",
        "v": "/account/support"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Navigation"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Account menu / rail"
       }
      ]
     ]
    ]
   }
  ]
 },
 "/account/support": {
  "routes": [
   "/account/profile",
   "/account/support"
  ],
  "title": "Placeholder Routes — Profile & Support",
  "summary": [
   {
    "t": "text",
    "v": "Two nav destinations that resolve to a real screen explaining "
   },
   {
    "t": "b",
    "parts": [
     {
      "t": "text",
      "v": "what specifically is missing"
     }
    ]
   },
   {
    "t": "text",
    "v": " — not \"coming soon\"."
   }
  ],
  "aliases": [
   "profile",
   "my account",
   "support tickets",
   "not built",
   "coming soon",
   "empty screens"
  ],
  "related": [
   "/admin/users",
   "/overview"
  ],
  "updated": "2026-08-24",
  "doc": "docs/screen-guides/placeholder-routes.md",
  "useCases": [
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Where are my profile settings?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "There is no auth layer, so there is no profile to show. Appearance preferences live on "
     },
     {
      "t": "link",
      "v": "Appearance",
      "href": "/admin/appearance"
     },
     {
      "t": "text",
      "v": " and are stored per browser."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"How do I raise a support ticket?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Not in this product. Use your existing support channel."
     }
    ]
   }
  ],
  "questions": [
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why is this screen empty?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. It is not empty — it explains what specifically blocks the screen. Profile needs an auth layer that does not exist; support tickets are an object that appears in no payload."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why does the nav link to a screen that does nothing?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. So the rail is never a set of dead links. Every destination resolves to a real route."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. When will these be built?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. — not recorded. Each is waiting on something specific, not on effort."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Where do I change my settings then?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. "
     },
     {
      "t": "link",
      "v": "Appearance",
      "href": "/admin/appearance"
     },
     {
      "t": "text",
      "v": " for how the product looks — stored in your browser. There is no user profile."
     }
    ]
   }
  ],
  "troubleshooting": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Symptom"
      }
     ],
     [
      {
       "t": "text",
       "v": "Likely cause"
      }
     ],
     [
      {
       "t": "text",
       "v": "What to do"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "text",
        "v": "Nothing on Profile"
       }
      ],
      [
       {
        "t": "text",
        "v": "No auth layer"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "No support ticketing"
       }
      ],
      [
       {
        "t": "text",
        "v": "No such object exists"
       }
      ],
      [
       {
        "t": "text",
        "v": "Use your existing channel"
       }
      ]
     ]
    ]
   }
  ],
  "states": [
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "One state: the explanation."
     }
    ]
   }
  ],
  "audience": [
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Anyone who clicks the nav item."
     }
    ]
   },
   {
    "type": "quote",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Roles are designed, not enforced."
       }
      ]
     },
     {
      "t": "text",
      "v": " See "
     },
     {
      "t": "text",
      "v": "README"
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   }
  ],
  "access": [
   {
    "type": "table",
    "head": [
     [],
     []
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Routes"
         }
        ]
       }
      ],
      [
       {
        "t": "code",
        "v": "/account/profile"
       },
       {
        "t": "text",
        "v": " · "
       },
       {
        "t": "code",
        "v": "/account/support"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Navigation"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Account menu / rail"
       }
      ]
     ]
    ]
   }
  ]
 },
 "/reports": {
  "routes": [
   "/reports"
  ],
  "title": "Reports",
  "summary": [
   {
    "t": "text",
    "v": "A picker over the "
   },
   {
    "t": "b",
    "parts": [
     {
      "t": "text",
      "v": "same computed views the dashboards use"
     }
    ]
   },
   {
    "t": "text",
    "v": ", with export."
   }
  ],
  "aliases": [
   "export",
   "extracts",
   "download",
   "reporting",
   "data export",
   "csv export"
  ],
  "related": [
   "/overview",
   "/sites",
   "/assets/condition",
   "/alarms"
  ],
  "updated": "2026-08-24",
  "doc": "docs/screen-guides/reports.md",
  "useCases": [
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"I need the exceptions list in a spreadsheet.\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Pick "
     },
     {
      "t": "i",
      "v": "Exceptions"
     },
     {
      "t": "text",
      "v": " → export."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Show me month-on-month progress.\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Not available."
       }
      ]
     },
     {
      "t": "text",
      "v": " One snapshot exists; a comparison would be fabricated. §14."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Do these numbers match the dashboard?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Yes, by construction — same functions."
     }
    ]
   }
  ],
  "questions": [
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Can I compare this month with last month?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. No. There is exactly one snapshot of this data, so a comparison would have to be invented. None is offered rather than a fabricated one."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Will these numbers match the dashboards?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Yes — they are the same computation, not a second implementation."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why is the device report empty?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Device data is empty on purpose pending the DMS extract."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Is this a report or an extract?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Honestly an extract — a picker over computed views with export. A report would answer a question; an extract asks you to do the work."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. What format does export produce?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. — not verified for this guide."
     }
    ]
   }
  ],
  "troubleshooting": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Symptom"
      }
     ],
     [
      {
       "t": "text",
       "v": "Likely cause"
      }
     ],
     [
      {
       "t": "text",
       "v": "What to do"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "text",
        "v": "Empty dataset"
       }
      ],
      [
       {
        "t": "text",
        "v": "No rows in scope, or device data empty"
       }
      ],
      [
       {
        "t": "text",
        "v": "Widen scope"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "No trend option"
       }
      ],
      [
       {
        "t": "text",
        "v": "Deliberately absent"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Export disagrees with a dashboard"
       }
      ],
      [
       {
        "t": "text",
        "v": "Should be impossible"
       }
      ],
      [
       {
        "t": "text",
        "v": "Check scope; otherwise report it"
       }
      ]
     ]
    ]
   }
  ],
  "states": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "State"
      }
     ],
     [
      {
       "t": "text",
       "v": "When"
      }
     ],
     [
      {
       "t": "text",
       "v": "What the user sees"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Populated"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Dataset has rows in scope"
       }
      ],
      [
       {
        "t": "text",
        "v": "The table"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Empty"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "No rows in scope"
       }
      ],
      [
       {
        "t": "text",
        "v": "Empty state"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Device report sparse"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Always, today"
       }
      ],
      [
       {
        "t": "text",
        "v": "Little or nothing"
       }
      ]
     ]
    ]
   }
  ],
  "audience": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Role"
      }
     ],
     [
      {
       "t": "text",
       "v": "Why"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Analyst"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Export for further work"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Admin / Super Admin"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Figures for reporting upward"
       }
      ]
     ]
    ]
   },
   {
    "type": "quote",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Roles are designed, not enforced."
       }
      ]
     },
     {
      "t": "text",
      "v": " See "
     },
     {
      "t": "text",
      "v": "README"
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   }
  ],
  "access": [
   {
    "type": "table",
    "head": [
     [],
     []
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Route"
         }
        ]
       }
      ],
      [
       {
        "t": "code",
        "v": "/reports"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Navigation"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Rail → Reports"
       }
      ]
     ]
    ]
   }
  ]
 },
 "/sites": {
  "routes": [
   "/sites"
  ],
  "title": "Sites",
  "summary": [
   {
    "t": "text",
    "v": "The individual survey records behind Overview's counts — roof type, orientation, feasibility verdict and "
   },
   {
    "t": "b",
    "parts": [
     {
      "t": "text",
      "v": "the specific reasons behind it"
     }
    ]
   },
   {
    "t": "text",
    "v": "."
   }
  ],
  "aliases": [
   "site records",
   "surveys",
   "survey records",
   "site list",
   "feasibility",
   "site browser"
  ],
  "related": [
   "/overview",
   "/assets/condition",
   "/alarms"
  ],
  "updated": "2026-08-24",
  "doc": "docs/screen-guides/sites.md",
  "useCases": [
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Show me the survey for this site.\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Set scope, find the row, read the verdict and its reasons."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Why was this marked Needs revisit?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "The reasons column. Typically the survey contradicts itself — "
     },
     {
      "t": "i",
      "v": "Rooftop Available? = No"
     },
     {
      "t": "text",
      "v": " while roof evidence was recorded."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Who surveyed this and how good was the GPS?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Contractor, employee and GPS accuracy are on the row."
     }
    ]
   }
  ],
  "questions": [
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why are there only 9 sites?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. That is how many rows "
     },
     {
      "t": "code",
      "v": "Solar PV Site Survey.csv"
     },
     {
      "t": "text",
      "v": " contains, transcribed field for field."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. My area shows no sites at all."
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Surveys exist only under SASARAM / Kaimur. The consumer master covers JAMUI, and the two extracts do not overlap."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. What is the difference between Sites and Assets?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Sites is the "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "record browser"
       }
      ]
     },
     {
      "t": "text",
      "v": " — one row per survey. "
     },
     {
      "t": "link",
      "v": "Assets",
      "href": "/assets/condition"
     },
     {
      "t": "text",
      "v": " is the "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "aggregate condition picture"
       }
      ]
     },
     {
      "t": "text",
      "v": " built from the same 9 records."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why is there no chart?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. It would duplicate Overview's "
     },
     {
      "t": "i",
      "v": "Registered by area"
     },
     {
      "t": "text",
      "v": " for no reason. This screen exists for the individual record."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Can I edit a survey?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. No. Read-only; corrections happen upstream and arrive with the next extract."
     }
    ]
   }
  ],
  "troubleshooting": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Symptom"
      }
     ],
     [
      {
       "t": "text",
       "v": "Likely cause"
      }
     ],
     [
      {
       "t": "text",
       "v": "What to do"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "text",
        "v": "No sites in my area"
       }
      ],
      [
       {
        "t": "text",
        "v": "Surveys only exist under SASARAM"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Counts differ from Overview"
       }
      ],
      [
       {
        "t": "text",
        "v": "They should not — same functions"
       }
      ],
      [
       {
        "t": "text",
        "v": "Check scope matches; otherwise report it"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "A verdict looks wrong"
       }
      ],
      [
       {
        "t": "text",
        "v": "Transcribed as recorded"
       }
      ],
      [
       {
        "t": "text",
        "v": "Correct upstream, re-import"
       }
      ]
     ]
    ]
   }
  ],
  "states": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "State"
      }
     ],
     [
      {
       "t": "text",
       "v": "When"
      }
     ],
     [
      {
       "t": "text",
       "v": "What the user sees"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Populated"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Surveys in scope"
       }
      ],
      [
       {
        "t": "text",
        "v": "Up to 9 records"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Empty"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "No surveys in scope"
       }
      ],
      [
       {
        "t": "text",
        "v": "Empty state — very common, since only SASARAM has surveys"
       }
      ]
     ]
    ]
   }
  ],
  "audience": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Role"
      }
     ],
     [
      {
       "t": "text",
       "v": "Why"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Service Engineer"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "The record for a site they are visiting"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Analyst"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Verdicts and their reasons"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "User (store operator)"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Whether their area's surveys landed"
       }
      ]
     ]
    ]
   },
   {
    "type": "quote",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Roles are designed, not enforced."
       }
      ]
     },
     {
      "t": "text",
      "v": " See "
     },
     {
      "t": "text",
      "v": "README"
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   }
  ],
  "access": [
   {
    "type": "table",
    "head": [
     [],
     []
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Route"
         }
        ]
       }
      ],
      [
       {
        "t": "code",
        "v": "/sites"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Navigation"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Rail → Sites"
       }
      ]
     ]
    ]
   }
  ]
 },
 "/telemetry/bms": {
  "routes": [
   "/telemetry/bms"
  ],
  "title": "BMS Telemetry",
  "summary": [
   {
    "t": "text",
    "v": "Battery pack readings across the fleet — state of charge, voltage, current and "
   },
   {
    "t": "b",
    "parts": [
     {
      "t": "text",
      "v": "temperature spread"
     }
    ]
   },
   {
    "t": "text",
    "v": ", with each value banded only when it is fresh enough to judge."
   }
  ],
  "aliases": [
   "battery telemetry",
   "battery packs",
   "BMS readings",
   "battery monitoring",
   "packs"
  ],
  "related": [
   "/assets",
   "/telemetry/ups",
   "/telemetry/meter",
   "/data/health",
   "/alarms"
  ],
  "updated": "2026-08-24",
  "doc": "docs/screen-guides/telemetry-bms.md",
  "useCases": [
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Which pack is overheating?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Sort by "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Temp spread"
       }
      ]
     },
     {
      "t": "text",
      "v": " descending. A high spread with low "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Faulty probes"
       }
      ]
     },
     {
      "t": "text",
      "v": " is a real thermal problem; a high spread with faulty probes may be a sensor."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Is this pack actually broken, or just not reporting?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Check "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Reporting"
       }
      ]
     },
     {
      "t": "text",
      "v": ". A pack at 0 % SOC with 0 cycles that has never reported is not a failing battery."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Why is this value grey / unknown?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Hover the reason. It says whether the value is missing, implausible, or needs a nameplate."
     }
    ]
   }
  ],
  "questions": [
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why is this screen empty?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. The BMS row array in "
     },
     {
      "t": "code",
      "v": "src/lib/device-data.js"
     },
     {
      "t": "text",
      "v": " is "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "empty on purpose"
       }
      ]
     },
     {
      "t": "text",
      "v": ". The source DMS holds 44 BMS readings and an extract has not been received. Rather than fill the screen with plausible-looking numbers, it renders its honest empty state."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why does a value have no colour?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. The reading is too stale to judge. A band on a stale reading would be a claim about the present the data cannot support."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. What is temperature spread and why does it matter more than the maximum?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. The gap between the hottest and coolest thermistor. Uneven cooling, a hot cell or a bad connection show up as spread and not as a high maximum."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. What does \"faulty probes\" mean?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Thermistors returning a sentinel instead of a temperature. The source DMS prints those as real values — "
     },
     {
      "t": "code",
      "v": "-58.0"
     },
     {
      "t": "text",
      "v": " — which is how a broken sensor gets mistaken for a thermal event."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Where are the other columns?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. The "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Columns"
       }
      ]
     },
     {
      "t": "text",
      "v": " menu. Eight of about twenty are visible by default."
     }
    ]
   }
  ],
  "troubleshooting": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Symptom"
      }
     ],
     [
      {
       "t": "text",
       "v": "Likely cause"
      }
     ],
     [
      {
       "t": "text",
       "v": "What to do"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "text",
        "v": "Empty table"
       }
      ],
      [
       {
        "t": "text",
        "v": "No BMS extract yet"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Values grey"
       }
      ],
      [
       {
        "t": "text",
        "v": "Missing, implausible, or nameplate-dependent"
       }
      ],
      [
       {
        "t": "text",
        "v": "Read the attached reason"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "No band colours"
       }
      ],
      [
       {
        "t": "text",
        "v": "Readings stale"
       }
      ],
      [
       {
        "t": "text",
        "v": "Check "
       },
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Reporting"
         }
        ]
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "A column is missing"
       }
      ],
      [
       {
        "t": "text",
        "v": "Hidden by default"
       }
      ],
      [
       {
        "t": "text",
        "v": "Columns menu"
       }
      ]
     ],
     [
      [
       {
        "t": "code",
        "v": "-58.0"
       },
       {
        "t": "text",
        "v": "-looking values"
       }
      ],
      [
       {
        "t": "text",
        "v": "Should not appear here"
       }
      ],
      [
       {
        "t": "text",
        "v": "Report it — this screen exists to prevent that"
       }
      ]
     ]
    ]
   }
  ],
  "states": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "State"
      }
     ],
     [
      {
       "t": "text",
       "v": "When"
      }
     ],
     [
      {
       "t": "text",
       "v": "What the user sees"
      }
     ],
     [
      {
       "t": "text",
       "v": "What to do"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Empty"
         }
        ]
       }
      ],
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Today, always"
         }
        ]
       }
      ],
      [
       {
        "t": "i",
        "v": "Readings not yet ingested"
       },
       {
        "t": "text",
        "v": " + the reason"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected — §14"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Populated"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Once an extract lands"
       }
      ],
      [
       {
        "t": "text",
        "v": "The table"
       }
      ],
      [
       {
        "t": "text",
        "v": "—"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "No results"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Filter matches nothing"
       }
      ],
      [
       {
        "t": "text",
        "v": "Empty overlay"
       }
      ],
      [
       {
        "t": "text",
        "v": "Clear the filter"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Unknown values"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Missing / implausible / no nameplate"
       }
      ],
      [
       {
        "t": "text",
        "v": "Grey with a reason"
       }
      ],
      [
       {
        "t": "text",
        "v": "Read the reason"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Unbanded"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Reading is stale"
       }
      ],
      [
       {
        "t": "text",
        "v": "No colour"
       }
      ],
      [
       {
        "t": "text",
        "v": "Correct — §5"
       }
      ]
     ]
    ]
   }
  ],
  "audience": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Role"
      }
     ],
     [
      {
       "t": "text",
       "v": "Why"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Service Engineer"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Which pack is failing, and whether the reading can be trusted"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Analyst"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Fleet-wide comparison across many columns"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Admin / Super Admin"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Whether battery data is arriving at all"
       }
      ]
     ]
    ]
   },
   {
    "type": "quote",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Roles are designed, not enforced."
       }
      ]
     },
     {
      "t": "text",
      "v": " See "
     },
     {
      "t": "text",
      "v": "README"
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   }
  ],
  "access": [
   {
    "type": "table",
    "head": [
     [],
     []
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Route"
         }
        ]
       }
      ],
      [
       {
        "t": "code",
        "v": "/telemetry/bms"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Navigation"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Rail → Telemetry → BMS"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Deep link"
         }
        ]
       }
      ],
      [
       {
        "t": "code",
        "v": "/telemetry/bms"
       },
       {
        "t": "text",
        "v": ". Scope and column visibility are "
       },
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "not"
         }
        ]
       },
       {
        "t": "text",
        "v": " in the URL"
       }
      ]
     ]
    ]
   }
  ]
 },
 "/telemetry/gti/:tab": {
  "routes": [
   "/telemetry/gti/:tab"
  ],
  "title": "GTI Telemetry",
  "summary": [
   {
    "t": "text",
    "v": "The rooftop gateway's four message streams — "
   },
   {
    "t": "b",
    "parts": [
     {
      "t": "text",
      "v": "Data · Heartbeat · Info · On-demand"
     }
    ]
   },
   {
    "t": "text",
    "v": " — each one a tab you can link to."
   }
  ],
  "aliases": [
   "gateway telemetry",
   "GTI streams",
   "data heartbeat info on-demand",
   "rooftop gateway",
   "message streams"
  ],
  "related": [
   "/telemetry/meter",
   "/assets",
   "/data/health"
  ],
  "updated": "2026-08-24",
  "doc": "docs/screen-guides/telemetry-gti.md",
  "useCases": [
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Is this gateway alive?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Heartbeat"
       }
      ]
     },
     {
      "t": "text",
      "v": " tab, then the freshness column."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"What firmware is it on?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Info"
       }
      ]
     },
     {
      "t": "text",
      "v": " tab. To correct it, go to the device registry — Info is a view."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Send a colleague the heartbeat stream.\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Copy the URL. The tab is in it."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Why is this device's nameplate only 50 % complete?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "The gateway half arrives empty in the heartbeat, and "
     },
     {
      "t": "code",
      "v": "rated_kw"
     },
     {
      "t": "text",
      "v": " is in no stream at all. See "
     },
     {
      "t": "link",
      "v": "Devices",
      "href": "/assets"
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   }
  ],
  "questions": [
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why are there four tabs?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. A gateway sends four kinds of message and they answer different questions. Flattening them would lose that."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Can I link to one stream?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Yes — the tab is a route segment, so "
     },
     {
      "t": "code",
      "v": "/telemetry/gti/heartbeat"
     },
     {
      "t": "text",
      "v": " is a real address. The source DMS cannot do this."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. What is the difference between the Data tab and the Meter screen?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Same messages. Data shows the envelope; "
     },
     {
      "t": "link",
      "v": "Meter",
      "href": "/telemetry/meter"
     },
     {
      "t": "text",
      "v": " shows the sixty-odd meter fields in the body."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Can I edit firmware on the Info tab?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. No. Info is a "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "view"
       }
      ]
     },
     {
      "t": "text",
      "v": " of the device registry's nameplate. It belongs on the device because the registry's completeness column depends on it living there."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why is the gateway part of Info blank?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. It arrives empty in the heartbeat. That is also why GTI nameplate completeness reads 50 %."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. How many gateways are there?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. One, across four streams, in the current extract."
     }
    ]
   }
  ],
  "troubleshooting": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Symptom"
      }
     ],
     [
      {
       "t": "text",
       "v": "Likely cause"
      }
     ],
     [
      {
       "t": "text",
       "v": "What to do"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "text",
        "v": "A tab is empty"
       }
      ],
      [
       {
        "t": "text",
        "v": "No messages of that type in scope"
       }
      ],
      [
       {
        "t": "text",
        "v": "Widen scope"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Info fields blank"
       }
      ],
      [
       {
        "t": "text",
        "v": "Gateway half empty in heartbeat"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Link opened the wrong stream"
       }
      ],
      [
       {
        "t": "text",
        "v": "Bare "
       },
       {
        "t": "code",
        "v": "/telemetry/gti"
       },
       {
        "t": "text",
        "v": " redirects to Data"
       }
      ],
      [
       {
        "t": "text",
        "v": "Link the full path"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Meter fields missing from Data"
       }
      ],
      [
       {
        "t": "text",
        "v": "They are on the Meter screen"
       }
      ],
      [
       {
        "t": "text",
        "v": "Go to "
       },
       {
        "t": "link",
        "v": "Meter",
        "href": "/telemetry/meter"
       }
      ]
     ]
    ]
   }
  ],
  "states": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "State"
      }
     ],
     [
      {
       "t": "text",
       "v": "When"
      }
     ],
     [
      {
       "t": "text",
       "v": "What the user sees"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Populated"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Messages in scope"
       }
      ],
      [
       {
        "t": "text",
        "v": "The stream's table"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Empty"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "No messages of that type"
       }
      ],
      [
       {
        "t": "text",
        "v": "That stream's empty state"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Heartbeat with empty nameplate half"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Always, today"
       }
      ],
      [
       {
        "t": "text",
        "v": "Blank gateway fields — expected"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Unknown tab in URL"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Mistyped"
       }
      ],
      [
       {
        "t": "text",
        "v": "— behaviour not verified"
       }
      ]
     ]
    ]
   }
  ],
  "audience": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Role"
      }
     ],
     [
      {
       "t": "text",
       "v": "Why"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Service Engineer"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Is the gateway alive; what firmware is it on"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Analyst"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Raw stream contents"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Admin / Super Admin"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Whether the ingestion is working"
       }
      ]
     ]
    ]
   },
   {
    "type": "quote",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Roles are designed, not enforced."
       }
      ]
     },
     {
      "t": "text",
      "v": " See "
     },
     {
      "t": "text",
      "v": "README"
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   }
  ],
  "access": [
   {
    "type": "table",
    "head": [
     [],
     []
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Route"
         }
        ]
       }
      ],
      [
       {
        "t": "code",
        "v": "/telemetry/gti/:tab"
       },
       {
        "t": "text",
        "v": " — "
       },
       {
        "t": "code",
        "v": "data"
       },
       {
        "t": "text",
        "v": ", "
       },
       {
        "t": "code",
        "v": "heartbeat"
       },
       {
        "t": "text",
        "v": ", "
       },
       {
        "t": "code",
        "v": "info"
       },
       {
        "t": "text",
        "v": ", "
       },
       {
        "t": "code",
        "v": "ondemand"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Bare route"
         }
        ]
       }
      ],
      [
       {
        "t": "code",
        "v": "/telemetry/gti"
       },
       {
        "t": "text",
        "v": " "
       },
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "redirects"
         }
        ]
       },
       {
        "t": "text",
        "v": " to "
       },
       {
        "t": "code",
        "v": "/telemetry/gti/data"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Navigation"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Rail → Telemetry → GTI (points at the Data stream)"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Deep link"
         }
        ]
       }
      ],
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Yes — the tab is in the URL."
         }
        ]
       },
       {
        "t": "text",
        "v": " Paste "
       },
       {
        "t": "code",
        "v": "/telemetry/gti/heartbeat"
       },
       {
        "t": "text",
        "v": " into a ticket and it opens there"
       }
      ]
     ]
    ]
   }
  ]
 },
 "/telemetry/meter": {
  "routes": [
   "/telemetry/meter"
  ],
  "title": "Meter Telemetry",
  "summary": [
   {
    "t": "text",
    "v": "Net metering from the rooftop "
   },
   {
    "t": "b",
    "parts": [
     {
      "t": "text",
      "v": "revenue meter"
     }
    ]
   },
   {
    "t": "text",
    "v": " — import and export registers on a single-phase C3 meter. "
   },
   {
    "t": "b",
    "parts": [
     {
      "t": "text",
      "v": "This is what the consumer is paid on."
     }
    ]
   }
  ],
  "aliases": [
   "net metering",
   "revenue meter",
   "import export",
   "billing registers",
   "meter readings",
   "MS fields"
  ],
  "related": [
   "/telemetry/gti/data",
   "/assets",
   "/data/health",
   "/reports"
  ],
  "updated": "2026-08-24",
  "doc": "docs/screen-guides/telemetry-meter.md",
  "useCases": [
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"What did this rooftop export last period?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Read the export register. Check "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Meter clock skew"
       }
      ]
     },
     {
      "t": "text",
      "v": " first — if the clock is wrong, the period boundaries are wrong too."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"A consumer disputes their bill.\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Open the payload dialog and trace the disputed figure to the field it came from."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Why is power factor blank?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Zero current. PF there is a register default, not a measurement."
     }
    ]
   }
  ],
  "questions": [
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why does this screen exist when the DMS already has \"GTI Data\"?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. The DMS shows five envelope columns and discards the sixty-odd meter fields underneath — including import, export, max demand and billing registers. Those are what the consumer is paid on."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. What is meter clock skew and should I worry?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. The meter's own clock against the message that carried the reading. One sample gateway is 25 days behind and another 72 days ahead. It matters because every other column looks normal, and the meter's billing stamps agree with its own wrong clock."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why is power factor blank?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Withheld at zero current, where PF is a register default rather than a measurement. Showing it would produce a false green."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. What is ingestion lag?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Filename UTC minus payload IST — 4–5 seconds in the sample."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Is this the same as the GTI Data screen?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Same messages, different half. GTI Data shows the envelope; this shows the meter body."
     }
    ]
   }
  ],
  "troubleshooting": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Symptom"
      }
     ],
     [
      {
       "t": "text",
       "v": "Likely cause"
      }
     ],
     [
      {
       "t": "text",
       "v": "What to do"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "text",
        "v": "No meter readings"
       }
      ],
      [
       {
        "t": "text",
        "v": "No Data messages in scope"
       }
      ],
      [
       {
        "t": "text",
        "v": "Widen scope"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Power factor blank"
       }
      ],
      [
       {
        "t": "text",
        "v": "Zero current"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Timestamps look wrong"
       }
      ],
      [
       {
        "t": "text",
        "v": "Meter clock skew"
       }
      ],
      [
       {
        "t": "text",
        "v": "Check the skew column"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Figures disagree with a bill"
       }
      ],
      [
       {
        "t": "text",
        "v": "Clock skew, or a different period"
       }
      ],
      [
       {
        "t": "text",
        "v": "Check skew, then the payload dialog"
       }
      ]
     ]
    ]
   }
  ],
  "states": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "State"
      }
     ],
     [
      {
       "t": "text",
       "v": "When"
      }
     ],
     [
      {
       "t": "text",
       "v": "What the user sees"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Empty"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "No meter readings in scope"
       }
      ],
      [
       {
        "t": "i",
        "v": "No meter readings in scope"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Populated"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Data messages present"
       }
      ],
      [
       {
        "t": "text",
        "v": "The table"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "PF unknown"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Zero current"
       }
      ],
      [
       {
        "t": "text",
        "v": "Grey with the reason"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Large clock skew"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Meter RTC wrong"
       }
      ],
      [
       {
        "t": "text",
        "v": "A skew value — everything else looks normal"
       }
      ]
     ]
    ]
   }
  ],
  "audience": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Role"
      }
     ],
     [
      {
       "t": "text",
       "v": "Why"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Analyst"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Import/export and billing registers"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Service Engineer"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Clock skew, tamper status, meter health"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Admin / Super Admin"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Whether revenue data is arriving intact"
       }
      ]
     ]
    ]
   },
   {
    "type": "quote",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Roles are designed, not enforced."
       }
      ]
     },
     {
      "t": "text",
      "v": " See "
     },
     {
      "t": "text",
      "v": "README"
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   }
  ],
  "access": [
   {
    "type": "table",
    "head": [
     [],
     []
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Route"
         }
        ]
       }
      ],
      [
       {
        "t": "code",
        "v": "/telemetry/meter"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Navigation"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Rail → Telemetry → Meter"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Related"
         }
        ]
       }
      ],
      [
       {
        "t": "link",
        "v": "`/telemetry/gti/data`",
        "href": "/telemetry/gti/data"
       },
       {
        "t": "text",
        "v": " shows the same messages' "
       },
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "envelope"
         }
        ]
       },
       {
        "t": "text",
        "v": "; this screen shows the meter "
       },
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "body"
         }
        ]
       }
      ]
     ]
    ]
   }
  ]
 },
 "/telemetry/ups": {
  "routes": [
   "/telemetry/ups"
  ],
  "title": "UPS Telemetry",
  "summary": [
   {
    "t": "text",
    "v": "Uninterruptible supplies across the fleet. "
   },
   {
    "t": "b",
    "parts": [
     {
      "t": "text",
      "v": "Mode leads"
     }
    ]
   },
   {
    "t": "text",
    "v": ", because bypass removes protection entirely while reporting no fault at all."
   }
  ],
  "aliases": [
   "UPS readings",
   "uninterruptible supply",
   "backup power",
   "inverter mode",
   "bypass"
  ],
  "related": [
   "/assets",
   "/telemetry/bms",
   "/data/health",
   "/alarms"
  ],
  "updated": "2026-08-24",
  "doc": "docs/screen-guides/telemetry-ups.md",
  "useCases": [
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Is anything on bypass right now?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Sort or filter by "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Mode"
       }
      ]
     },
     {
      "t": "text",
      "v": ". Bypass is the highest-severity state and is banded as such."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"Is this UPS near its limit?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Read "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Load %"
       }
      ]
     },
     {
      "t": "text",
      "v": ". If it is "
     },
     {
      "t": "code",
      "v": "unknown"
     },
     {
      "t": "text",
      "v": ", the registry is missing "
     },
     {
      "t": "code",
      "v": "rated_va"
     },
     {
      "t": "text",
      "v": " — fix it on "
     },
     {
      "t": "link",
      "v": "Devices",
      "href": "/assets"
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   },
   {
    "type": "h",
    "text": [
     {
      "t": "text",
      "v": "\"The whole fleet shows zero volts — is there an outage?\""
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "text",
      "v": "Almost certainly not. "
     },
     {
      "t": "code",
      "v": "0.00"
     },
     {
      "t": "text",
      "v": " is treated as missing, not measured. See §14."
     }
    ]
   }
  ],
  "questions": [
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why is this screen empty?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. The UPS row array in "
     },
     {
      "t": "code",
      "v": "device-data.js"
     },
     {
      "t": "text",
      "v": " is empty on purpose. The DMS holds 42 UPS readings; no extract has been received."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why does Load % say unknown when Load has a number?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. The percentage needs "
     },
     {
      "t": "code",
      "v": "rated_va"
     },
     {
      "t": "text",
      "v": " from the device registry, and it is missing. A bare number that looks like a percentage but is not one would be worse than saying so."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. The whole fleet shows 0 V — is there an outage?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. No. 41 of the source's 42 rows carry "
     },
     {
      "t": "code",
      "v": "0.00"
     },
     {
      "t": "text",
      "v": ", and the plausibility floor treats that as "
     },
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "missing"
       }
      ]
     },
     {
      "t": "text",
      "v": ", not measured. The fleet is un-reporting, not browned-out."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. Why does Mode lead the table?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. Bypass removes protection entirely while reporting no fault. The source DMS omits mode altogether, which makes the most dangerous state invisible."
     }
    ]
   },
   {
    "type": "p",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Q. The Mode column is there but says the field is absent — is it broken?"
       }
      ]
     },
     {
      "t": "text",
      "v": " A. No — deliberate. If the extract does not carry mode, the column says so rather than disappearing, because an absent field and a healthy field must not look alike."
     }
    ]
   }
  ],
  "troubleshooting": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Symptom"
      }
     ],
     [
      {
       "t": "text",
       "v": "Likely cause"
      }
     ],
     [
      {
       "t": "text",
       "v": "What to do"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "text",
        "v": "Empty table"
       }
      ],
      [
       {
        "t": "text",
        "v": "No UPS extract"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Load % unknown"
       }
      ],
      [
       {
        "t": "text",
        "v": "Registry missing "
       },
       {
        "t": "code",
        "v": "rated_va"
       }
      ],
      [
       {
        "t": "text",
        "v": "Complete the nameplate on "
       },
       {
        "t": "link",
        "v": "Devices",
        "href": "/assets"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Voltage unknown everywhere"
       }
      ],
      [
       {
        "t": "text",
        "v": "Source reports "
       },
       {
        "t": "code",
        "v": "0.00"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected correction"
       }
      ]
     ],
     [
      [
       {
        "t": "text",
        "v": "Mode blank"
       }
      ],
      [
       {
        "t": "text",
        "v": "Extract lacks the field"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected; the column says so"
       }
      ]
     ]
    ]
   }
  ],
  "states": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "State"
      }
     ],
     [
      {
       "t": "text",
       "v": "When"
      }
     ],
     [
      {
       "t": "text",
       "v": "What the user sees"
      }
     ],
     [
      {
       "t": "text",
       "v": "What to do"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Empty"
         }
        ]
       }
      ],
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Today, always"
         }
        ]
       }
      ],
      [
       {
        "t": "i",
        "v": "Readings not yet ingested"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected — §14"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Mode column present but empty"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Extract lacks the field"
       }
      ],
      [
       {
        "t": "text",
        "v": "The column states the field is absent"
       }
      ],
      [
       {
        "t": "text",
        "v": "Expected — deliberate"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Load % unknown"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "No "
       },
       {
        "t": "code",
        "v": "rated_va"
       }
      ],
      [
       {
        "t": "text",
        "v": "Grey, with the reason"
       }
      ],
      [
       {
        "t": "text",
        "v": "Complete the nameplate"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Voltage unknown"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Reported "
       },
       {
        "t": "code",
        "v": "0.00"
       }
      ],
      [
       {
        "t": "text",
        "v": "Grey"
       }
      ],
      [
       {
        "t": "text",
        "v": "Correct — §14"
       }
      ]
     ]
    ]
   }
  ],
  "audience": [
   {
    "type": "table",
    "head": [
     [
      {
       "t": "text",
       "v": "Role"
      }
     ],
     [
      {
       "t": "text",
       "v": "Why"
      }
     ]
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Service Engineer"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Is anything on bypass, and is any unit near its limit"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Analyst"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Load trends across the fleet"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Admin / Super Admin"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Whether UPS data is arriving"
       }
      ]
     ]
    ]
   },
   {
    "type": "quote",
    "text": [
     {
      "t": "b",
      "parts": [
       {
        "t": "text",
        "v": "Roles are designed, not enforced."
       }
      ]
     },
     {
      "t": "text",
      "v": " See "
     },
     {
      "t": "text",
      "v": "README"
     },
     {
      "t": "text",
      "v": "."
     }
    ]
   }
  ],
  "access": [
   {
    "type": "table",
    "head": [
     [],
     []
    ],
    "rows": [
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Route"
         }
        ]
       }
      ],
      [
       {
        "t": "code",
        "v": "/telemetry/ups"
       }
      ]
     ],
     [
      [
       {
        "t": "b",
        "parts": [
         {
          "t": "text",
          "v": "Navigation"
         }
        ]
       }
      ],
      [
       {
        "t": "text",
        "v": "Rail → Telemetry → UPS"
       }
      ]
     ]
    ]
   }
  ]
 }
};
