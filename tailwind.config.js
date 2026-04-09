tailwind.config = {
    darkMode: "class",
    safelist: [
        'text-neon-blue', 'border-neon-blue', 'bg-neon-blue',
        'text-neon-red', 'border-neon-red', 'bg-neon-red',
        'text-neon-green', 'border-neon-green', 'bg-neon-green',
        'text-neon-purple', 'border-neon-purple', 'bg-neon-purple'
    ],
    theme: {
        extend: {
            colors: {
                "void": "#050505",           // Deepest black background
                "surface-dark": "#0e0e11",   // Elevated cards
                "neon-blue": "#00f0ff",      // Primary futuristic accent
                "neon-green": "#39ff14",     // Success/South lane
                "neon-red": "#ff003c",       // Critical/Manual Override
                "neon-purple": "#b026ff",    // Secondary accent
            },
            fontFamily: {
                "headline": ["Manrope"],
                "body": ["Inter"]
            },
        },
    },
}