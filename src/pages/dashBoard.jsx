import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button,  Form, Modal, Nav, Navbar, NavDropdown, InputGroup,  } from "react-bootstrap";
import { useHistory } from 'react-router';
import { useWallet } from 'use-wallet';
import { bnToDec } from '../utils';

import ListedFormBG from "../assets/bg-listed.jpg";


import tickmarkIcon from "../assets/tickmarkIcon.svg";
import openIcon from "../assets/openIcon.svg";
import roundBallIcon from "../assets/roundBallIcon.svg";


import { formatAddress } from "../utils";

import FarmCard from "../components/farmCard";

import BigNumber from 'bignumber.js'
const DashBoard = () => {
    const { account, connect, reset, balance, chainId } = useWallet();
   
    const history = useHistory();
 

    const [show, setShow] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSuccessClose = () => { setShowSuccess(false) };
   
    const handleClose = () => setShow(false);
   
   
    const onDisconnectWallet = () => {
        reset();
      //  setUserAccount(null);
        localStorage.removeItem("account");
        localStorage.removeItem("walletProvider");
    
      }
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
          history.push('/dashboard');
        }
        else {
            history.push('/');
        }
        console.log("111=",chainId)
      }, [account, chainId, history]);

    const onFormSubmit = () => {
        setShow(false);
        setShowSuccess(true)
    }
    return (
        
        <Container fluid className="main_layout" style={{ backgroundColor: '#000000', marginInline: '0px' }}>
          
            <div class="flex ml-4 mt-4 bg-gray-800 p-4 text-white rounded-lg fixed right-4 top-2">
                <div className="font-bold pr-8">{bnToDec(new BigNumber(balance)).toFixed(4)} ETH</div>
                <div className="flex items-center">
                    <div className="pr-2">{account ? formatAddress(account): ""}</div>
                    <div><img src={roundBallIcon} alt=""/></div>
                </div>
            </div>

            
            <div className="max-w-3xl mx-auto rounded-xl border border-gray-800 p-4 mt-12">
            
            
                <div style={{ marginBottom: 12, borderRadius: 10, width: '100%', backgroundSize: 'cover', paddingBottom: '45%', backgroundPosition: 'bottom', backgroundImage: 'url(/farm.jpg)' }}></div>

                <Container className="">
                    <Row>
                        <Col xl="12">
                            <div className="mb-8 font-bold text-2xl text-white">Stake one or more LP tokens to earn CHIZ</div>
                        </Col>
                    </Row>
                    <Row className="pb-2">
                        <Col style={{'color':'#ffffff' }}>
                            Showing <span style={{ 'font-size': '18px', 'color':'#ffffff' }}>2 staking pools</span>
                        </Col>
                    </Row>
                    <Row className="mb-32">
                        {/*dummyData.map(i => <Col lg={4} sm={12} md={6} style={{ 'marginTop': 16 }}>
                            
                                    </Col>)}*/
                        <FarmCard
                        themeClass={true}
                        onChangeWallet={onChangeWallet}
                        account={account}
                        />
                    }
                    
                    </Row>

                    <Modal show={show} onHide={handleClose} animation={false} style={{ borderRadius: '24px' }}>
                        <Modal.Body className="p-0 form-listtoken">
                            <div className="gradient" style={{ backgroundSize: 'cover', backgroundImage: "url(" + ListedFormBG + ")"}}>

                                <Row className="p-4 pb-0">
                                    <Col lg={12}>
                                        <h1 className="text-center">List your dog token</h1>
                                    </Col>
                                    <Col lg={12}>
                                        <div className="mx-auto" style={{ maxWidth: '400px' }}>
                                            <p className="text-center mb-0">Complete the form below if you’d like to discuss partnership opportunities.</p>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                            <div className="mx-auto py-4" style={{ maxWidth: '360px', padding:'0 15px' }}>
                                <Row>
                                    <Col lg={12}><p style={{ color: '#F51C66' }}><strong>KawaFarm application form</strong></p></Col>
                                    <Col lg={12}>
                                        <Form onSubmit={onFormSubmit}>
                                            <Form.Group controlId="projectname">
                                                <Form.Label className="formlabel">PROJECT NAME</Form.Label>
                                                <Form.Control type="text" placeholder="e.g. Dogelon" />
                                            </Form.Group>
                                            <Form.Group controlId="ticker">
                                                <Form.Label className="formlabel">TICKER</Form.Label>
                                                <Form.Control type="text" placeholder="e.g. ELON" />
                                            </Form.Group>
                                            <Form.Group controlId="websiteurl">
                                                <Form.Label className="formlabel">WEBSITE URL</Form.Label>
                                                <Form.Control type="text" placeholder="www.dogelon.com" />
                                            </Form.Group>
                                            <Form.Group controlId="yourmessage">
                                                <Form.Label className="formlabel">YOUR MESSAGE</Form.Label>
                                                <Form.Control as="textarea" rows={3} placeholder="Start typing..." />
                                                <Form.Text className="text-muted">
                                                    Max 200 characters.
                                                </Form.Text>
                                            </Form.Group>
                                            <Button type="submit" className="addMore" block style={{ borderRadius: "12px", border: 'none' }}>Submit form</Button>
                                        </Form>

                                    </Col>
                                </Row>
                            </div>


                        </Modal.Body>

                    </Modal>
                    <Modal show={showSuccess} onHide={handleSuccessClose} animation={false} style={{ borderRadius: '24px' }}>
                        <Modal.Body className="p-4 modalSucces successModal">
                            <div>
                                <div className="mx-auto p-4" style={{ textAlign: "center" }}>
                                    <Row><Col><img src={tickmarkIcon} alt="" /></Col></Row>
                                    <Row><Col><h2>Application Sent</h2></Col></Row>
                                    <Row><Col><p style={{ color: '#543939' }}>Thank you for expressing interest in partnering with Kawakami Inu! One of our team members will get back to you shortly.</p></Col></Row>
                                    <Row>
                                        <Col>
                                            <div>
                                                <Button className="successModalButton" variant="outline-success" size="md" onClick={handleSuccessClose}>
                                                    BACK TO KAWAFARM
                                                </Button>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        </Modal.Body>
                    </Modal>
                </Container>
            </div>
        </Container>
    );
};

export default DashBoard;
