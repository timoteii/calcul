import React, { Component } from "react";
import "./styles/App.css";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage.js'; // Главная страница вашего приложения
import LoginPage from './components/LoginPage';
import ModalForm_5 from './components/ModalForm_5'; // Ваш модальный компонент

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
          isModalVisible: false,
          modalFormData: null,
        };
      }
    
      toggleModalVisibility = () => {
        this.setState((prevState) => ({
          isModalVisible: !prevState.isModalVisible,
        }));
      };
    
      handleSaveToPDF = (data) => {
        this.setState({ modalFormData: data });
      };
    
      render() {
        const { isModalVisible, modalFormData } = this.state;
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
        return (
          <Router>
            <Routes>
              <Route path="/login" component={LoginPage} />
              <Route path="/" render={() => (
                isAuthenticated ? <HomePage /> : <Navigate to="/login" />
              )} />
            </Routes>
            <ModalForm_5
              isModalVisible={isModalVisible}
              onClose={this.toggleModalVisibility}
              modalFormData={modalFormData}
            />
          </Router>
        );
      }
}

export default App;
