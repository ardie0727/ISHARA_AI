import isharalogo from './assets/isharalogo.png'
import {Link} from 'react-router-dom'
const Navbar = () => {
    const tags=["Home","About Us\n","Learn","Translate","Profile"]
    return ( 
        <>
        <div className="navsep">
        <nav className="navbar">
        <Link to='/' className='logo'><img src={isharalogo} alt="ISHARA.AI"></img>ISHARA AI</Link>
        <div className="links">
            <Link to="/" className="home">{tags[0]}</Link>
            <Link to="/aboutus" className="aboutus">{tags[1]}</Link>
            <Link to="/learn" className="learn">{tags[2]}</Link>
            <Link to="/translate" className="translate">{tags[3]}</Link>
            <Link to="/profile" className="profile">{tags[4]}</Link>       
        </div>
        </nav>
        </div>
        </>
     );
}
 
export default Navbar;