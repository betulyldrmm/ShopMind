import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import AuthForm from './pages/AuthForm';
import Home1 from './pages/Home1';
import UrunListesi from './components/Details/UrunListesi';
import UrunDetay from './components/Details/UrunDetay';
import Sepet from './pages/Sepet'
import KendineHediye from './pages/KendineHediye/KendineHediye';
import SporaBasla from './pages/SporaBasla/SporaBasla';
import HobiEdin from './pages/HobiEdin/HobiEdin';
import KendinleKal from './pages/KendinleKal/KendinleKal';
import CommentSystem from './pages/CommentSystem';
import CategoryPage from './components/CategoryPage/CategoryPage';
import GiftFinderHomepage from './components/GiftFinderHomepage/GiftFinderHomepage';
import PastaTatli from './pages/anne/yemek-yapmak/PastaTatli';
import EvTemizligi from './pages/anne/yemek-yapmak/temizlik/EvTemizligi';
import WheelComponent from './components/Wheel/WheelComponent';
import Dikis from './pages/anne/dikis/Dikis';
import ProfilePage from './pages/ProfilPage/ProfilPage';
import Stores from './pages/About/Stores';
import About from './pages/About/About';
import Contact from './pages/About/Contact';
import Arac from './pages/baba/otomobil/arac';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/authForm' element={<AuthForm />} />
        <Route path='/home1' element={<Home1 />} />
         <Route path="/urunler" element={<UrunListesi />} />
            <Route path="/urun/:urunId" element={<UrunDetay />} />
            <Route path='/sepet' element={<Sepet/>}/>
            <Route path='/KendineHediye' element={<KendineHediye/>}/>
            <Route path='/SporaBasla' element={<SporaBasla/>}/>
            <Route path='/HobiEdin' element={<HobiEdin/>}/>
            <Route path='/KendinleKal' element={<KendinleKal/>}/>
            <Route path='/CommentSystem' element={<CommentSystem/>}/>
            <Route path="/kategori/:categorySlug" element={<CategoryPage />} />
        <Route path="/kategori/:categorySlug/:subCategorySlug" element={<CategoryPage />} />
        <Route path='/GiftFinderHomePage' element={<GiftFinderHomepage/>}/>
     <Route path="/anne/yemek-yapmak/pasta-tatli" element={<PastaTatli />} />
      <Route path="/anne/temizlik/ev-temizligi" element={<EvTemizligi />} />
      <Route path="/anne/dikis/dikis" element={<Dikis />} />
      <Route path="/cark" element={<WheelComponent />} />
      <Route path='/ProfilePage' element={<ProfilePage/>}/>
      <Route path='/About' element={<About/>}/>
      <Route path='/Stores' element={<Stores/>}/>
      <Route path='/Contact' element={<Contact/>}/>
      <Route path='/baba/otomobil/arac' element={<Arac/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
