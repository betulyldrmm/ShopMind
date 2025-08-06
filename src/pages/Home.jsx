import React from 'react';
import Header from '../components/Header/Header';
import Categories from '../components/Categories/Categories';
import SearchCategories from '../components/SearchCategories/SearchCategories';
import Sale from '../components/Sale/Sale';
import PopularProducts from '../components/PopularProduction/PopularProducts';
import Brand from '../components/Brand/Brand';
import Product from '../components/Product/Product';
import Footer from '../components/Footer/Footer';
import GiftCategories from '../components/GiftCategories/GiftCategories';



const Home = () => {
  return (
    <>
      <Header />
      <Categories />
      <SearchCategories></SearchCategories>  <br></br><br></br>
     
      <GiftCategories></GiftCategories>
      <Product></Product><br></br><br></br>
      <Sale></Sale>
    <PopularProducts></PopularProducts>
    

     <Product></Product><br></br><br></br>
     
     <Footer></Footer>
    </>
  );
};

export default Home;
