import React, { useEffect } from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import { useHistory } from 'react-router-dom'
import Metamask from "../assets/metamask.svg";
import WConnect from "../assets/wallet-connect.svg";
import { useWallet } from 'use-wallet';

const SignIn = props => {

    const history=useHistory();
    const { account, connect } = useWallet();
   
    useEffect(() => {
        const localAccount = localStorage.getItem("account");
        const walletProvider = localStorage.getItem("walletProvider");
        if (!account && localAccount) {
        
          if (localAccount && (walletProvider === "metamask" || walletProvider === "injected")) {
            connect("injected");
            localStorage.setItem("walletProvider", "metamask");
          }
          if (localAccount && walletProvider === "walletconnect") {
            connect('walletconnect');
            localStorage.setItem("walletProvider", "walletconnect");
          }
        }
      }, [account, connect]);
    
      const onChangeWallet = (data) => {
        if (data === 'metamask') {
          connect("injected");
          localStorage.setItem("walletProvider", "metamask");
        
        } else if (data === 'walletconnect') {
          connect("walletconnect");
          localStorage.setItem("walletProvider", "walletconnect");
        
        }
      }
    
      useEffect(() => {
        if (account) {
        
          localStorage.setItem("account", account);
          history.push('/dashboard')
        }
        else {
            history.push('/')
        }
      }, [account, history]);
    
      

    return (
        <Container fluid className="main_layout">

            <Row style={{ zIndex: '10000', opacity:1 }} >

                <Col lg={{ span: 4, offset: 4 }}  className="d-flex flex-column justify-content-center" style={{maxWidth:'480px', marginLeft: 'auto', marginRight:'auto', width:'100%', padding:'60px 0' }}>
                    <Row>
                        <Col sm={{span:0}} className="logo-image-container">
                            {/*<Image src={dogAvtar} roundedCircle style={{ marginLeft:'auto', marginRight:'auto', display:'block' }} />*/}
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={12}>
                           {/* <img alt="KawaFarm" src={logoKawafarm} className="svg-kawa" />*/}
                        </Col>
                    </Row>

                    <Row>
                        <Col lg={12} className="pt-12 text-center intro-text">
                            <span className="text-center font-bold">Farm <strong className="font-bold" style={{ color: "#FF2E59" }}>CHIZ</strong> by staking the LP tokens!</span>
                        </Col>
                    </Row>
                    <Row>
                        
                        <Col lg={{ span: 12 }} style={{ padding: 4 }}>

                            <div className="p-12 m-4 rounded-lg bg-gray-700">
                                <Row className="pb-4 text-center">
                                    <Col lg={12}>
                                        <h3 className="text-white">Connect your wallet to start farming</h3>
                                    </Col>
                                </Row>

                                <a href="# " variant="light" className="mt-8 py-2 px-4 rounded-lg bg-gray-100 flex items-center" onClick={() => { onChangeWallet('metamask'); }}>
                                    <div className="flex-grow"><span>Connect with Metamask</span></div>
                                    <div className=""><img src={ Metamask } alt=""/></div>
                                </a>

                                <a href="# " variant="light" className="mt-4 py-2 px-4 rounded-lg bg-gray-100 flex items-center" onClick={() => { onChangeWallet('walletconnect'); }}>
                                    <div className="flex-grow"><span>Use Wallet Connect</span></div>
                                    <div className=""> <img src={ WConnect } alt=""/></div>
                                </a>

                               
                               
                            </div>
                            <div className="mt-4 px-4">

                                <a href="https://metamask.io/faqs" style={{color: '#339af0'}} target="_blank" rel="noreferrer">Don't have a wallet set up?</a>

                            </div>

                        </Col>
                    </Row>
                </Col>
            </Row>
 
                   
              
        </Container>

    );
};

export default SignIn;
