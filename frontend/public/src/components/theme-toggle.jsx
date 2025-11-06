const { useState, useEffect } = React;

function ThemeToggle() {
    const [isLight, setIsLight] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            setIsLight(true);
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }, []);

    const toggleTheme = () => {
        const newIsLight = !isLight;
        setIsLight(newIsLight);
        localStorage.setItem('theme', newIsLight ? 'light' : 'dark');
        document.documentElement.setAttribute('data-theme', newIsLight ? 'light' : 'dark');
        
        // Обновляем графики при смене темы
        setTimeout(() => {
            if (window.updateChartsOnThemeChange) {
                window.updateChartsOnThemeChange();
            }
        }, 300);
    };

    return React.createElement('label', { 
        className: 'theme-switch',
        style: {
            position: 'relative',
            display: 'inline-block',
            width: '60px',
            height: '30px'
        }
    },
        React.createElement('input', {
            type: 'checkbox',
            checked: isLight,
            onChange: toggleTheme,
            style: {
                opacity: 0,
                width: 0,
                height: 0
            }
        }),
        React.createElement('span', { 
            className: 'slider',
            style: {
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'var(--border)',
                transition: '0.4s',
                borderRadius: '34px'
            }
        })
    );
}

const themeRoot = ReactDOM.createRoot(document.getElementById('react-theme-toggle'));
themeRoot.render(React.createElement(ThemeToggle));