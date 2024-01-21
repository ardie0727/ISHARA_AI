import isharalogo from './assets/isharalogo.png'
const Navbar = () => {
    const tags=["Home","About Us\n","Learn","Translate","Profile"]
    return ( 
        <>
        <div className="navsep">
        <nav className="navbar">
        <a href='/' className='logo'><img src={isharalogo} alt="ISHARA.AI"></img>ISHARA AI</a>
        <div className="links">
            <a href="/" className="home">{tags[0]}</a>
            <a href="/aboutus" className="aboutus">{tags[1]}</a>
            <a href="/learn" className="learn">{tags[2]}</a>
            <a href="/translate" className="translate">{tags[3]}</a>
            <a href="/profile" className="profile">{tags[4]}</a>
        
        </div>
        
        </nav>
        </div>
        </>
     );
}
 
export default Navbar;