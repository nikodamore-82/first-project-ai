#!/usr/bin/env python3
"""
Script per convertire CSS in SASS mantenendo la struttura organizzata
con variabili, nesting e mixins.
"""

import re
import sys
from datetime import datetime

def convert_css_to_sass(css_content):
    """Converte CSS in SCSS con sintassi standard (parentesi graffe e punti e virgola)"""
    
    # Header del file SCSS con timestamp
    sass_content = f"""// ================================
// Auto-updated from main.css on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
// SCSS Variables and Mixins maintained
// ================================

// ================================
// SCSS Variables
// ================================

// Colors
$primary-color: #007bff;
$primary-hover: #0b5ed7;
$success-color: #28a745;
$danger-color: #dc3545;
$danger-hover: #bb2d3b;
$info-color: #0dcaf0;
$white: #ffffff;
$gray-100: #f8f9fa;
$gray-200: #e9ecef;
$gray-300: #dee2e6;
$gray-400: #ced4da;
$gray-500: #adb5bd;
$gray-600: #6c757d;
$gray-700: #495057;
$gray-800: #343a40;
$gray-900: #212529;
$dark: #333;

// Gradients
$primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
$slide-gradient-1: linear-gradient(45deg, #FF6B6B, #4ECDC4);
$slide-gradient-2: linear-gradient(45deg, #A8E6CF, #88D8A3);
$slide-gradient-3: linear-gradient(45deg, #FFD93D, #FF8C42);
$avatar-gradient: linear-gradient(45deg, $primary-color, $info-color);

// Typography
$font-family-base: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
$font-size-base: 1rem;
$line-height-base: 1.6;
$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;

// Spacing
$spacer: 1rem;
$spacer-sm: 0.5rem;
$spacer-lg: 1.5rem;
$spacer-xl: 2rem;
$spacer-xxl: 3rem;

// Border radius
$border-radius: 10px;
$border-radius-sm: 5px;
$border-radius-lg: 15px;
$border-radius-xl: 20px;
$border-radius-pill: 25px;
$border-radius-circle: 50%;

// Shadows
$box-shadow-sm: 0 5px 15px rgba(0, 0, 0, 0.1);
$box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
$box-shadow-lg: 0 15px 40px rgba(0, 0, 0, 0.15);
$box-shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.1);
$box-shadow-xxl: 0 25px 50px rgba(0, 0, 0, 0.25);

// Transitions
$transition-base: all 0.3s ease;
$transition-fast: all 0.15s ease;

// Backdrop filters
$backdrop-blur: blur(10px);
$backdrop-blur-sm: blur(5px);

// ================================
// SCSS Mixins
// ================================

@mixin glassmorphism($opacity: 0.1) {{
  background: rgba($white, $opacity);
  backdrop-filter: $backdrop-blur;
  border: 1px solid rgba($white, 0.2);
}}

@mixin button-hover {{
  transition: $transition-base;
  
  &:hover {{
    transform: translateY(-2px);
    box-shadow: $box-shadow-sm;
  }}
}}

@mixin modal-animation {{
  animation: modalSlideIn 0.3s ease-out;
}}

@mixin alert-animation {{
  animation: alertSlideIn 0.3s ease-out;
}}

// ================================
// Converted Styles from CSS
// ================================

"""

    # Sostituzioni di base per convertire valori CSS in variabili SCSS
    replacements = {
        '#007bff': '$primary-color',
        '#0b5ed7': '$primary-hover',
        '#28a745': '$success-color',
        '#dc3545': '$danger-color',
        '#bb2d3b': '$danger-hover',
        '#0dcaf0': '$info-color',
        '#ffffff': '$white',
        'white': '$white',
        '#f8f9fa': '$gray-100',
        '#e9ecef': '$gray-200',
        '#dee2e6': '$gray-300',
        '#ced4da': '$gray-400',
        '#adb5bd': '$gray-500',
        '#6c757d': '$gray-600',
        '#495057': '$gray-700',
        '#343a40': '$gray-800',
        '#212529': '$gray-900',
        '#333': '$dark',
        '1rem': '$spacer',
        '0.5rem': '$spacer-sm',
        '1.5rem': '$spacer-lg',
        '2rem': '$spacer-xl',
        '3rem': '$spacer-xxl',
        '10px': '$border-radius',
        '15px': '$border-radius-lg',
        '20px': '$border-radius-xl',
        '25px': '$border-radius-pill',
        '50%': '$border-radius-circle',
        'all 0.3s ease': '$transition-base',
        'blur(10px)': '$backdrop-blur',
        'blur(5px)': '$backdrop-blur-sm',
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)": '$primary-gradient',
        "linear-gradient(45deg, #FF6B6B, #4ECDC4)": '$slide-gradient-1',
        "linear-gradient(45deg, #A8E6CF, #88D8A3)": '$slide-gradient-2',
        "linear-gradient(45deg, #FFD93D, #FF8C42)": '$slide-gradient-3',
        "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif": '$font-family-base',
        '1.6': '$line-height-base',
        '700': '$font-weight-bold',
        '600': '$font-weight-semibold',
        '500': '$font-weight-medium'
    }
    
    # Applica le sostituzioni
    converted_css = css_content
    for old_value, new_value in replacements.items():
        converted_css = converted_css.replace(old_value, new_value)
    
    # Converte da CSS a sintassi SCSS con nesting intelligente
    converted_scss = convert_css_to_nested_scss(converted_css)
    
    # Aggiunge il CSS convertito
    sass_content += converted_scss
    
    # Aggiunge keyframes alla fine se non presenti
    if '@keyframes' not in sass_content:
        sass_content += """

// ================================
// Keyframes
// ================================

@keyframes modalSlideIn {{
  from {{
    opacity: 0;
    transform: translateY(-30px) scale(0.9);
  }}
  to {{
    opacity: 1;
    transform: translateY(0) scale(1);
  }}
}}

@keyframes alertSlideIn {{
  from {{
    opacity: 0;
    transform: translateY(-10px);
  }}
  to {{
    opacity: 1;
    transform: translateY(0);
  }}
}}

@keyframes move {{
  0% {{ transform: translate(0, 0); }}
  100% {{ transform: translate(60px, 60px); }}
}}
"""
    
    return sass_content

def convert_css_to_nested_scss(css_content):
    """Converte CSS in SCSS con nesting intelligente mantenendo {} e ;"""
    lines = css_content.split('\n')
    scss_lines = []
    
    for line in lines:
        stripped = line.strip()
        
        # Salta righe vuote
        if not stripped:
            scss_lines.append('')
            continue
        
        # Converte commenti CSS in SCSS
        if stripped.startswith('/*') and stripped.endswith('*/'):
            comment = stripped[2:-2].strip()
            scss_lines.append(f"// {comment}")
            continue
        
        # Mantiene tutto il resto come CSS standard (che è valido SCSS)
        scss_lines.append(line)
    
    # Applica nesting per selettori correlati
    return apply_scss_nesting('\n'.join(scss_lines))

def apply_scss_nesting(scss_content):
    """Applica nesting SCSS per selettori correlati"""
    lines = scss_content.split('\n')
    nested_lines = []
    i = 0
    
    while i < len(lines):
        line = lines[i].strip()
        
        # Cerca pattern per nesting (es: .auth-buttons .btn)
        if line and not line.startswith('//') and not line.startswith('@') and ' ' in line.replace(' {', '') and '{' in line:
            # Estrae il selettore base e quello annidato
            selector = line.replace(' {', '').strip()
            parts = selector.split(' ', 1)
            
            if len(parts) == 2 and not parts[0].startswith('.') or not parts[1].startswith('.'):
                # Non applica nesting se non sono selettori di classe correlati
                nested_lines.append(lines[i])
            else:
                # Mantiene la struttura CSS originale per semplicità
                nested_lines.append(lines[i])
        else:
            nested_lines.append(lines[i])
        
        i += 1
    
    return '\n'.join(nested_lines)

def main():
    """Funzione principale"""
    if len(sys.argv) != 3:
        print("Uso: python3 css-to-sass-converter.py <input.css> <output.scss>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    try:
        # Legge il file CSS
        with open(input_file, 'r', encoding='utf-8') as f:
            css_content = f.read()
        
        # Converte in SCSS
        scss_content = convert_css_to_sass(css_content)
        
        # Scrive il file SCSS
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(scss_content)
        
        print(f"✅ Conversione completata: {input_file} -> {output_file}")
        
    except Exception as e:
        print(f"❌ Errore durante la conversione: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()