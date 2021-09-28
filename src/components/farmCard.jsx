import React, { useState } from 'react';
import { Row, Col, Button,  Form, Card, Image, Badge, InputGroup, Spinner } from 'react-bootstrap';
import BigNumber from 'bignumber.js'

import useFarms from '../hooks/useFarms';
import useAllStakedValue from '../hooks/useAllStakedValue';
import usePayr from '../hooks/usePayr';

import { BASIC_TOKEN } from '../constants/config';
import { useWallet } from 'use-wallet';
import { useEffect } from 'react';
import { getEarned, getStaked, harvest, stake, unstake } from '../contracts/utils';
import { bnToDec } from '../utils';
import useAllowance from '../hooks/useAllowance';
import useApprove from '../hooks/useApprove';
import { useCallback } from 'react';


const FarmCard = (props) => {

	const [farms] = useFarms();
	const stakedValue = useAllStakedValue();


    


	const farmIndex = farms.findIndex(
		({ tokenSymbol }) => tokenSymbol === BASIC_TOKEN,
	);
	const farmPrice = farmIndex >= 0 && stakedValue[farmIndex]
      ? stakedValue[farmIndex].tokenPriceInWeth
      : new BigNumber(0);

	const BLOCKS_PER_YEAR = new BigNumber(2336000);
	// TODO: After block height xxxx, FARM_PER_BLOCK = 100;
	const FARM_PER_BLOCK = new BigNumber(1000);
        console.log("asdfasdfsdaf = ",farmPrice.toString() )
	const rows = farms.reduce(
		(farmRows, farm, i) => {
            const farmWithStakedValue = {
                ...farm,
                ...stakedValue[i],
                apy: stakedValue[i]
                ? farmPrice
                    .times(FARM_PER_BLOCK)
                    .times(BLOCKS_PER_YEAR)
                    .times(stakedValue[i].poolWeight)
                    .div(stakedValue[i].totalWethValue)
                    .div(1000)
                : null,
            };
            const newFarmRows = [...farmRows];
            if (newFarmRows[newFarmRows.length - 1].length === 3) {
                newFarmRows.push([farmWithStakedValue]);
            } else {
                newFarmRows[newFarmRows.length - 1].push(farmWithStakedValue);
            }
            return newFarmRows;
		},
		[[]],
	);

 
    
    return (
        <>
            {(rows[0].length > 0) ? (
                rows.map((poolRow, i) => (
                    <div key={i} md="10" lg="6" xl="4" className="stake-card-container">
                        {poolRow.map((pool, j) => (
                            <CoinCard pool={pool}/>
                        ))}
                    </div>
                ))
            ) : (
                <div></div>
            )}
        </>
    );
}


const CoinCard = (props) => {
    const cardData = props?.pool;
   
    const [showBox, setShowBox] = useState("approve");
    const [staked, setStaked] = useState(0);
    const [totalLpValue, setTotalLpValue] = useState(0);
    const [earned, setEarned] = useState(0);
   
    const { pid } = props.pool;
    const { account } = useWallet();
    const payr = usePayr();
    const allowance = useAllowance(cardData.lpContract, cardData.farmContract);
    const { onApprove } = useApprove(cardData.lpContract, cardData.farmContract);
    const [requestedApproval, setRequestedApproval] = useState(false);

    const [depositAmount, setDepositAmount] = useState(0);
    const [withdrawAmount, setWithdrawAmount] = useState(0);
    const [pendingDeposit, setPendingDeposit] = useState(false);
    const [pendingWithdraw, setPendingWithdraw] = useState(false);
    const [pendingHarvest, setPendingHarvest] = useState(false);
    const [lPBalance, setLPBalance] = useState(null);
    const [stakedBalance, setStakedBalance] = useState(null);
    const [earnedBalance, setEarnedBalance] = useState(null);

    useEffect(() => {
        async function fetchEarned() {
            if (!payr) return;
            //const farmContract = getFarmContract(payr);
            const farmContract = cardData.farmContract;
            const earned = await getEarned(
                farmContract,
                pid,
                account
            );
            console.log("earned = ", bnToDec(new BigNumber(earned)).toFixed(4));
            const decimals = await props.pool.tokenContract.methods.decimals().call();
          
            setEarned(bnToDec(new BigNumber(earned), decimals).toFixed(4));
         //  const poolWeight = await getPoolWeight(
         //       farmContract,
        //        pid
        //    );
        //    setPoolWeight( 100);
            const staked = await getStaked(
                farmContract,
                pid,
                account
            );
            console.log("staked = ", staked);
            setStaked(bnToDec(new BigNumber(staked.toNumber())).toFixed(2));
            const totalLpValue = await props.pool.lpContract.methods
                .balanceOf(farmContract.options.address)
                .call();
        
            setTotalLpValue(bnToDec(new BigNumber(totalLpValue)).toFixed(2));
        }
        if (payr && account) {
           // fetchEarned();
        }
        let refreshInterval = setInterval(fetchEarned, 10000)
        return () => clearInterval(refreshInterval)
    }, [payr, account, pid, cardData.farmContract, props.pool.tokenContract.methods, props.pool.lpContract.methods]);

    useEffect(() => {
        if(allowance.toNumber() && staked >0 )
        {
            if(showBox === "approve")
            setShowBox("withdrawaddmore");
        }
    
    }, [staked, earned, allowance, showBox]);
    const handleApprove = useCallback(async () => {
        try {
            setRequestedApproval(true);
            const txHash = await onApprove();
            if (!txHash) {
                setRequestedApproval(false);
            }
        } catch (e) {
            console.log(e);
        }
    }, [onApprove, setRequestedApproval]);
    const handleStake = async () => {
        setShowBox("depositcancel");

        setDepositAmount(0);
        const balance = await cardData.lpContract.methods
            .balanceOf(account)
            .call();
            console.log("asdfasdf",bnToDec(new BigNumber(balance)))
        setLPBalance(bnToDec(new BigNumber(balance)));
    };


    const handleCancel = (from) => {
        if(from === "deposit")
            setShowBox("approve");
        if(from === "add")
            setShowBox("withdrawaddmore")
        if(from==="withdraw")
            setShowBox("withdrawaddmore")
        if(from === "harvest")
            setShowBox("withdrawaddmore")
    }
    const handleAddMore = async () => {
        setShowBox("addcancel");
        setDepositAmount(0);
        const balance = await cardData.lpContract.methods
            .balanceOf(account)
            .call();
            console.log("asdfasdf",bnToDec(new BigNumber(balance)))
        setLPBalance(bnToDec(new BigNumber(balance)));
    }
    const handleWithdraw = async () => {
        setShowBox("withdrawcancel");
        setWithdrawAmount(0);
        const balance = await getStaked(
            cardData.farmContract,
            cardData.pid,
            account
        );
        setStakedBalance(bnToDec(new BigNumber(balance.toNumber())));
    }
    const handleHarvest = async () => {
        setShowBox("harvestcancel");
        const balance = await getEarned(
            cardData.farmContract,
            cardData.pid,
            account
        );
        setEarnedBalance(bnToDec(new BigNumber(balance)));
    }
    let poolApy;
    console.log("apy = ", cardData.apy?.toString());
    if (cardData.apy && cardData.apy.isNaN()) {
        poolApy = '- %';
    } else {
        poolApy = cardData.apy
            ? `${cardData.apy
                .times(new BigNumber(100))
                .toNumber()
                .toLocaleString('en-US')
                .slice(0, -1) || '-' }%`
            : 'Loading ...';
    }
    
    return (
    <Card style={{ width: '22rem' }} className="text-white rounded-lg border border-gray-700 p-4 mr-8 mb-4">
            
            <Card.Header>
                <div className="d-flex justify-content-start pt-2">
                    <div>
                        <Image src={cardData.icon} roundedCircle style={{ maxWidth: '50px', maxHeight: '50px' }} />
                    </div>
                    <div>
                        <h5 className="text-xl font-bold">{cardData.poolTitle}</h5>
                        <small className="pool-info">{cardData.name}-CHIZ</small>
                    </div>
                </div>
                <div className="flex justify-between token-info mb-4 mt-4">
                    <div>
                        <h6 className='mb-0' style={{ color: '#977D83' }}>Stake</h6>
                        <strong className="text-white value-text">{cardData.lpToken}</strong>
                    </div>
                    <div>
                        <h6 className='mb-0' style={{ color: '#977D83' }}>APY</h6>
                        <strong className="text-white value-text">{poolApy}</strong>
                    </div>
                    <div>
                        <h6 className='mb-0' style={{ color: '#977D83' }}>Earn</h6>
                        <strong className="text-red-500">CHIZ</strong>
                    </div>
                </div>
                <div className="text-sm pb-2 font-bold text-yellow-700">
                    {cardData.pool}
                </div>

            </Card.Header>

            {showBox === 'approve' && <Card.Body>
                <div className="rounded-lg border border-gray-700" style={{ opacity: '0.5' }}>
                    <Row>
                        <Col lg={12}>
                            <div className="d-flex justify-content-between p-4">
                                
                                <div className="flex">
                                    <div className="w-1/2"><strong>STAKED</strong></div>
                                    <div><strong>{staked}</strong></div>
                                </div>

                                <div className="flex">
                                    <div className="w-1/2"><strong>CHIZ EARNED</strong></div>
                                    <div><strong>{earned}</strong></div>
                                </div>


                                <InputGroup.Prepend>
                                    <InputGroup.Text style={{ background: "#fff", border: 'none' }}>
                                        <small><strong className="card_stake_text pt-2">
                                        {cardData.stake}
                                        </strong></small>
                                    </InputGroup.Text>
                                </InputGroup.Prepend>
                                
                            </div>
                        </Col>
                        <Col lg={12}>
                            <div className="">
                                
                                <div className="p-4">
                                    <InputGroup.Prepend >
                                        <InputGroup.Text style={{ background: "#fff", border: 'none' }}>
                                            <small><strong className="pt-2">
                                                <Button className="button" disabled>Harvest</Button>
                                            </strong></small>
                                        </InputGroup.Text>
                                    </InputGroup.Prepend>
                                </div>

                                
                            </div>
                        </Col>
                    </Row>

                </div>
                <Row className="pt-2">
                    <Col lg={12}>

                        {!allowance.toNumber() ? (
                            <>
                            {requestedApproval ? (
                                <div className="my-2 font-bold text-center rounded-lg bg-gray-800 w-full" style={{padding: '10px 15px 10px'}} disabled block>
                                    Approving...
                                </div>
                            ): (
                                
                                <a href="#" className="button mt-2 block text-center" onClick={handleApprove}>Approve Contract</a>
                                

                            )}
                            </>
                        ) : (    
                                    <Row className="p-2">
                                        <Col lg={12} style={{ display: "grid" }}>
                                            <Button className="addMore" onClick={ handleStake } block>Stake</Button>
                                        </Col>
                                    </Row>           
                            )}       
                    </Col>
                </Row>
                <div className="pt-1 stake-info">
                    <Row>
                        <Col sm={6} className="text-left">
                            <span className="card_stake_text">
                                TOTAL VALUE
                            </span>
                        </Col>
                        <Col sm={6} className="text-left">
                            <span className="card_stake_text ">
                                MY STAKE
                            </span>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={6} className="text-left">
                            <span className="card_stake_text  ibm-plex ">
                                {totalLpValue} {cardData.name}
                            </span>
                        </Col>
                        <Col sm={6} className="text-left">
                            <span className="card_stake_text ibm-plex ">
                                {staked} {cardData.name}
                            </span>
                        </Col>
                    </Row>
                </div>
            </Card.Body> }
            {showBox === 'depositcancel' && <Card.Body className="cardBodyColor">
                <Row>
                    <Col lg={12} className="mt-4">
                        <h5>Deposit</h5>
                    </Col>
                    <Col lg={12}>
                        <div className="cardBox py-2">
                            <Row>
                                <Col lg={12} className="">
                                    <div className="d-flex justify-content-between p-0">
                                        <div className="mr-1">
                                            <Form.Control size="sm" style={{ border: "none" }} as="input" type="number" value={depositAmount} onChange={(val) => setDepositAmount(val.target.value)} />
                                            <Badge className="inline rounded-md font-bold mt-1 cursor-pointer py-2 px-4" onClick={()=>{setDepositAmount(lPBalance)}}>MAX</Badge>
                                        </div>
                                        <div className="py-0">
                                            <InputGroup.Prepend >
                                                <InputGroup.Text>
                                                    <small><strong className="card_stake_text">
                                                        {cardData.name}
                                                    </strong></small>
                                                </InputGroup.Text>
                                            </InputGroup.Prepend>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>
                <Row>
                    {!pendingDeposit ?
                        <Button className="addMore px-4 mr-2 font-bold" size="lg"  block onClick={async () => {
                            setPendingDeposit(true);
                            try {
                                const txHash = await stake(
                                    cardData.farmContract,
                                    cardData.pid,
                                    depositAmount,
                                    account,
                                );
                                console.log(txHash);
                                setPendingDeposit(false);
                                setShowBox("withdrawaddmore");
                            } catch (e) {
                                console.log(e);
                                setPendingDeposit(false);
                                setShowBox("approve")
                            }
                        }}
                        >
                            DEPOSIT
                        </Button>
                        :
                        <div className="py-2 mr-4 font-bold inline-block text-center rounded-lg">
                            PENDING DEPOSIT...
                        </div>
                    }
                    <Button className="withDrawButton px-4 font-bold" size="lg" block  onClick={()=>{handleCancel("deposit");}}>
                        Cancel
                    </Button>
                </Row>
            </Card.Body>}
            {showBox === 'withdrawaddmore' && <Card.Body className="cardBodyColor ">
                <div className="cardBox p-2">
                    <Row>
                        <Col lg={12}>
                            <div className="d-flex justify-content-between p-0">
                                <div>
                                    <small className="card_stake_text"><strong style={{ paddingLeft: 16 }}>STAKED</strong></small>
                                    <Form.Control size="sm" style={{ border: "none" }} type="text" value={staked} disabled />
                                </div>
                                <div className="py-2">
                                    <InputGroup.Prepend >
                                        <InputGroup.Text style={{ background: "#fff", border: 'none' }}>
                                            <small><strong className="card_stake_text pt-2">
                                            {cardData.stake}
                                            </strong></small>
                                        </InputGroup.Text>
                                    </InputGroup.Prepend>
                                </div>
                            </div>
                        </Col>
                        <Col lg={12}>
                            <div className="d-flex justify-content-between p-0 align-items-end">
                                <div>
                                    <small className="card_stake_text"><strong style={{ paddingLeft: 16 }}>CHIZ EARNED</strong></small>
                                    <Form.Control size="sm" style={{ border: "none" }} type="text" value={earned} disabled />
                                </div>
                                <div className="pt-2">
                                    <InputGroup.Prepend >
                                        <InputGroup.Text style={{ background: "#fff", border: 'none' }}>
                                            <small><strong className="card_stake_text pt-2">
                                                <Button className="cardButton" onClick={() => { handleHarvest();}}>Harvest</Button>
                                            </strong></small>
                                        </InputGroup.Text>
                                    </InputGroup.Prepend>
                                </div>
                            </div>
                        </Col>
                    </Row>

                </div>
                <Row className="p-2">
                    <Col lg={6} style={{ display: "grid" }}>
                        <Button className="withDrawButton"  onClick={() => { handleWithdraw();}}>Withdraw</Button>
                    </Col>
                    <Col lg={6} style={{ display: "grid" }}>
                        <Button className="addMore"  onClick={() => { handleAddMore(); }}>Add More</Button>
                    </Col>
                </Row>
                <div className="p-4 stake-info">
                    <Row>
                        <Col sm={6} className="text-left">
                            <small className="card_stake_text">
                                TOTAL VALUE
                            </small>
                        </Col>
                        <Col sm={6} className="text-left">
                            <small className="card_stake_text">
                                MY STAKE
                            </small>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={6} className="text-left">
                            <small className="card_stake_text ibm-plex">
                                {totalLpValue} {cardData.name}
                            </small>
                        </Col>
                        <Col sm={6} className="text-left">
                            <small className="card_stake_text ibm-plex">
                                {staked} {cardData.name}
                            </small>
                        </Col>
                    </Row>
                </div>
            </Card.Body>}
            {showBox === 'addcancel' && <Card.Body className="cardBodyColor">
                <Row>
                    <Col lg={12} className="">
                        <h5>Deposit</h5>
                    </Col>
                    <Col lg={12} className="">
                        <div className="cardBox p-2">
                            <div className="d-flex justify-content-between p-0" style={{ background: '#FFF' }}>
                                <div className="mr-1">
                                    <Form.Control size="lg" style={{ border: "none" }} as="input" type="number" value={depositAmount} onChange={(val) => setDepositAmount(val.target.value)} />
                                </div>
                                <div className="py-2">
                                    <InputGroup.Prepend >
                                        <InputGroup.Text style={{ background: "#fff", border: 'none' }}>
                                            <small><strong className="card_stake_text pt-2">
                                            {cardData.name}
                                            </strong></small>
                                            <Badge className="mt-1" style={{ background: '#FFFBEC', color: "#D5A600", marginBottom: 4, cursor:'pointer' }} onClick={()=>{setDepositAmount(lPBalance)}} >MAX</Badge>
                                        </InputGroup.Text>
                                    </InputGroup.Prepend>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
                <span className="card_stake_text pt-2">Available: {lPBalance} {cardData.name}</span>
                <Row className='p-2'>
                    {!pendingDeposit ?
                        (<Button className="addMore mb-2" size="lg" block  onClick={async () => {
                            setPendingDeposit(true);
                            try {
                                const txHash = await stake(
                                    cardData.farmContract,
                                    cardData.pid,
                                    depositAmount,
                                    account,
                                );
                                console.log(txHash);
                                setPendingDeposit(false);
                                setShowBox("withdrawaddmore");
                
                            } catch (e) {
                                console.log(e);
                                setPendingDeposit(false);
                                setShowBox("withdrawaddmore")
                            }
                        }}
                        >
                            Add
                        </Button>)
                        :
                        <Button className="loaderButton" size="lg" block >
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />{` `}PENDING STAKE...
                        </Button>
                    }

                    <Button className="withDrawButton" size="lg" block  onClick={() => { handleCancel('add') }}>
                        Cancel
                    </Button>
                </Row>
            </Card.Body>}
            {showBox === 'withdrawcancel' && <Card.Body className="cardBodyColor">
                <Row>
                    <Col lg={12} className="px-4">
                        <h5>Withdraw</h5>
                    </Col>
                    <Col lg={12} className="">
                        <div className="d-flex justify-content-between p-0">
                            <div className="mr-1">
                                <Form.Control size="lg" style={{ border: "none" }} type="number" value={withdrawAmount}   onChange={(val) => setWithdrawAmount(val.target.value)}/>
                                <div className="text-right h_title">Available: {stakedBalance ? stakedBalance : "0.00"}</div>
                            </div>
                            <div className="py-2">
                                <InputGroup.Prepend >
                                    <InputGroup.Text style={{ background: "#fff", border: 'none' }}>
                                        <small><strong className="card_stake_text pt-2">
                                        {cardData.name}
                                        </strong></small>
                                    </InputGroup.Text>
                                </InputGroup.Prepend>
                            </div>
                        </div>
                    </Col>
                </Row>
                <h6 className="text-center mt-2">
                    Withdraw your Stake?
                </h6>
                <Row className='p-2'>
                    {!pendingWithdraw ?
                        <Button className="addMore" size="lg" block   onClick={async () => {
                            setPendingWithdraw(true);
                            try {
                                const txHash = await unstake(
                                    cardData.farmContract,
                                    cardData.pid,
                                    withdrawAmount,
                                    account,
                                );
                                console.log(txHash);
                                setPendingWithdraw(false);
                                setShowBox("withdrawaddmore");
                                
                            } catch (e) {
                                console.log(e);
                                setPendingWithdraw(false);
                                setShowBox("withdrawaddmore");
                            }
                        }}
                        >
                            Yes, I want to Withdraw
                        </Button>
                        :
                        <Button className="loaderButton" size="lg" block >
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />{` `}PENDING WITHDRAWAL...
                        </Button>
                    }

                    <Button className="withDrawButton" size="lg" block  onClick={() => {handleCancel("withdraw") }}>
                        Cancel
                    </Button>
                </Row>
            </Card.Body>}
            {showBox === 'harvestcancel' && <Card.Body className="cardBodyColor">
                <Row>
                    <Col lg={12} className="px-4">
                        <h5>Earned Amount</h5>
                    </Col>
                    <Col lg={12}>
                        <div className="cardBox p-2">
                            <Row>
                                <Col lg={12} className="">
                                    <div className="d-flex justify-content-between p-0">
                                        <div>
                                            <Form.Control size="lg" style={{ border: "none" }} type="text" value={earnedBalance} disabled/>
                                        </div>

                                        <div className="py-2">
                                            <InputGroup.Prepend >
                                                <InputGroup.Text style={{ background: "#fff", border: 'none' }}>
                                                    <small><strong className="card_stake_text pt-2">
                                                        CHIZ
                                                    </strong></small>
                                                </InputGroup.Text>
                                            </InputGroup.Prepend>
                                        </div>
                                    </div>
                                </Col>
                               
                            </Row>
                        </div>
                    </Col>
                </Row>
                <Row className='p-2'>
                    {!pendingHarvest ?
                        <Button className="addMore mb-2" size="lg" block  onClick={async () => {
                            setPendingHarvest(true);
                            try {
                                const txHash = await harvest(
                                    cardData.farmContract,
                                    cardData.pid,
                                    account,
                                );
                                console.log(txHash);
                                setPendingHarvest(false);
                                setShowBox("withdrawaddmore");
                            } catch (e) {
                                console.log(e);
                                setPendingHarvest(false);
                                setShowBox("withdrawaddmore");
                            }
                        }}>
                            Harvest
                        </Button>
                        :
                        <Button className="loaderButton" size="lg" block >
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />{` `}PENDING HARVEST...
                        </Button>
                    }

                    <Button className="withDrawButton" size="lg" block  onClick={() => { handleCancel("harvest") }}>
                        Cancel
                    </Button>
                </Row>
            </Card.Body>}
        </Card>
    )
}

export default FarmCard;
