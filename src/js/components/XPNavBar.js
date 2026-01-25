// XPNavBar.js - Navigation bar (Home | About | Writings)

window.AppComponents = window.AppComponents || {};

window.AppComponents.XPNavBar = ({ currentPage, onNavigate }) => {
    const navItems = [
        { id: 'home', label: 'Home' },
        { id: 'about', label: 'About' },
        { id: 'writings', label: 'Writings' }
    ];

    return (
        <div className="xp-nav-bar">
            {navItems.map(item => (
                <button
                    key={item.id}
                    className={currentPage === item.id || (currentPage === 'post' && item.id === 'writings') ? 'active' : ''}
                    onClick={() => onNavigate(item.id)}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
};
