import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  useLocation,
  Routes,
  Route,
} from 'react-router-dom';

import Header from './components/header.jsx'; 

import Index from './pages/Index';
import Listing from './pages/listing';
import MessageHub from './pages/Messaginghub';
import Message from './pages/Message';
import CreateItem from './pages/CreateItem';
import Login from './pages/login';
import Registration from './pages/registration';
import Profile from './pages/Profile';
import Confirmation from './pages/Confirmation';
import ItemPage from './pages/ItemPage';
import TeamPage from './pages/TeamPage';
import MemberPage from './pages/memberPage.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppWrapper() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/listing" element={<Listing />} />
        <Route path="/messagehub" element={<MessageHub />} />
        <Route path="/message/:listingId/:sellerId/:buyerId" element={<Message />} />
        <Route path="/profile/:userID" element={<Profile />} />
        <Route path="/create" element={<CreateItem />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/item/:id" element={<ItemPage />} />
        <Route path="/TeamPage" element={<TeamPage />} />
        <Route path="/TeamPage/:memberId" element={<MemberPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;