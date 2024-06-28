import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import arrow from './img/arrow.svg';
import blob1 from './img/blob_top.svg';
import blob2 from './img/blob_bottom.svg';
import card from './img/image.jpg';
import chart from './img/chart.svg';
import phone from './img/phone.svg';
import ring1 from './img/ring_orange.svg';
import message1 from './img/message_pink.svg';
import message2 from './img/message_blue.svg';
import logo from './img/logo.jpg';
import bg from './img/bg.svg';
import { Fade, Roll, Bounce} from 'react-reveal';
import InstagramIcon from "@material-ui/icons/Instagram";
import TwitterIcon from "@material-ui/icons/Twitter";
import FacebookIcon from "@material-ui/icons/Facebook";
import LinkedInIcon from "@material-ui/icons/LinkedIn";

const GlobalStyle = createGlobalStyle`
    :root{
        --purple-primary: #554DDE;
        --accent-pink: #F44E77;
        --neutral-light: #F2F6FF;
        --lavender-secondary: #6A6D9E; /*Primary Font Color*/
        --dark-primary: #16194F;
        --border-colour: #CAD6F1;
    }
    *{
        margin: 0;
        padding: 0;
        list-style: none;
        box-sizing: border-box;
        font-family: 'Nunito', sans-serif;
        text-decoration: none;
    }
    body{
        background-color: var(--neutral-light);
        color: white;
        font-size: 1.2rem;
    }
    a{
        color: inherit;
    }
    p{
        color: var(--lavender-secondary);
        line-height: 1.9rem;
    }
    .secondary-heading{
        font-size: 3rem;
        color: var(--purple-primary);
    }
    .small-heading{
        font-size: 2.5rem;
        color: var(--purple-primary);
        text-align: center;
    }
    span{
        color: var(--accent-pink);
    }
    .c-para{
        text-align: center;
    }
`;

const OuterLayout = styled.section`
    background: #d0a3cd;
    padding: 5rem 18rem;
    @media screen and (max-width: 1347px){
        padding: 5rem 14rem;
    }
    @media screen and (max-width: 1186px){
        padding: 5rem 8rem;
    }
    @media screen and (max-width: 990px){
        padding: 5rem 4rem;
    }
`;

const InnerLayout = styled.section`
    padding: 8rem 0;
`;

const MainStyled = styled.main``;

const HeaderStyled = styled.header`
    min-height: 100vh;
    width: 100%;
    background-image: url(${bg});
    background-repeat: no-repeat;
    background-size: cover;
    background-position-y: 100%;
    .header-content{
        padding: 0 18rem;
        @media screen and (max-width: 1347px){
            padding: 5rem 14rem;
        }
        @media screen and (max-width: 1186px){
            padding: 5rem 8rem;
        }
        @media screen and (max-width: 990px){
            padding: 5rem 4rem;
        }
    }
`;

const HeaderContentStyled = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    padding-top: 3rem;
    @media screen and (max-width: 700px){
        grid-template-columns: repeat(1, 1fr);
    }
    .left-content{
        display: flex;
        align-items: center;
        padding-right: 3rem;
        .white{
            color:white;
        }
        h1{
            font-size: 4rem;
            font-weight: 600;
            @media screen and (max-width: 700px){
                font-size: 3rem;
            }
        }
        .white{
            padding: 1.4rem 0;
            line-height: 1.8rem;
        }
    }
    .right-content{
        position: relative;
        display: flex;
        justify-content: center;
        .phone{
            width: 80%;
        }
        .ring1, .message1, .message2{
            position: absolute;
            transition: all .4s ease-in-out;
        }
        .ring1{
            bottom: 10%;
            right: 0;
            animation: move2 20s infinite;
        }
        .message1{
            top: 0;
            right: 0;
            animation: move 5s infinite;
        }
        .message2{
            bottom: 15%;
            left: 0;
            animation: move 8s infinite;
            animation-delay: .5s;
        }
    }
    @keyframes move{
        0%, 100%{ transform: translateY(0) rotate(0) scale(1) translateX(0); }
        50%{ transform: translateY(-10px) rotate(20deg) scale(1.1) translateX(10px); }
    }
    @keyframes move2{
        0%, 100%{ transform: translateY(0) rotate(0) scale(1) translateX(0); }
        50%{ transform: translateY(-10px) rotate(60deg) scale(1.1) translateX(10px); }
    }
`;

const NavigationStyled = styled.nav`
    display: flex;
    justify-content: space-between;
    min-height: 10vh;
    align-items: center;
    .logo img{
        width: 80px;
        height: auto;
    }
    ul {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        width: 40%;
        margin-right: 1rem;
    }
    li {
        padding: 0 1rem;
    }
    @media (max-width: 768px) {
        .logo {
            display: none;
        }
    }
`;

const AnimatedButtonStyled = styled.button`
    background-color: var(--dark-primary);
    padding: 1rem 2rem;
    font-family: inherit;
    font-size: inherit;
    color: inherit;
    border-radius: 20px;
    outline: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
    transition: all .4s ease-in-out;
    .arrow{
        padding-left: .9rem;
        transition: all .4s ease-in-out;
    }
    &:hover{
        color: var(--accent-pink);
        .blob1{ transform: translateX(-100px); }
        .blob2{ transform: translateX(140px); }
        .arrow{ padding-left: 1.4rem; }
    }
    .blob1, .blob2{
        position: absolute;
        pointer-events: none;
        transition: all .4s ease-in-out;
    }
    .blob1{ top: 0; right: 0; }
    .blob2{ bottom: 0; left: 0; }
`;

const ButtonStyled = styled.button`
    background-color: var(--accent-pink);
    padding: .7rem 2rem;
    font-family: inherit;
    font-size: inherit;
    color: inherit;
    border-radius: 20px;
    outline: none;
    border: none;
    cursor: pointer;
`;

const CardSectionStyled = styled.section`
    .card-container{
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        @media screen and (max-width: 845px){
            grid-template-columns: repeat(1, 1fr);
        }
        .card-right{
            display: flex;
            justify-content: flex-end;
            img{filter: drop-shadow(0px 50px 100px rgba(22, 25, 79, 0.15));}
        }
        .card-left{
            p{ padding: 1rem 0; }
        }
    }
`;

const ChartStyled = styled.section`
    .chart-con{
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        @media screen and (max-width: 1347px){
            grid-template-columns: repeat(1, 1fr);
        }
        .chart-left{
            width: 80%;
            @media screen and (max-width: 1347px){
                width: 100%;
            }
            .stats{
                img{
                    box-shadow: 0px 25px 50px rgba(22, 25, 79, 0.05);
                    border-radius: 62px;
                    width: 100%;
                }
                .stats-certificate{
                    display: flex;
                    padding-bottom: 1.3rem;
                    justify-content: space-between;
                }
            }
        }
        .chart-right{
            padding-left: 2rem;
            p{ padding: 1.3rem 0; }
        }
    }
`;

const ChartStatsStyled = styled.div`
    background-color: #e8d0e6;
    border-radius: 50px;
    border: 1px solid var(--border-colour);
    height: 10rem;
    padding: 2rem;
    box-shadow: 0px 25px 50px rgba(22, 25, 79, 0.05);
    h4{
        font-size: 3rem;
        color: var(--purple-primary);
    }
    p{
        color: black;
    }
`;

const FooterStyled = styled.footer`
    padding: 1rem 5rem;
    background-color: #a95ea7;
    max-width: 100%;
    margin-top: auto;
    height: fit-content;

    .footer-con {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-end; /* Align items to the right */

        .top-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;

            .logo-con {
                display: flex;
                align-items: center;

                img {
                    width: 70px;
                    height: auto;
                    margin-right: 1rem;
                }

                p {
                    margin: 0;
                    font-size: 1rem;
                    color: #16194F;
                }
            }

            .button-nav {
                display: flex;
                list-style-type: none;
                padding: 0;

                li {
                    padding: 0 1rem;
                    color: #16194F;

                    a {
                        color: #16194F;
                        text-decoration: none;
                        transition: color 0.3s ease;

                        &:hover {
                            color: #4EE0F4;
                        }
                    }
                }
            }
        }

        .social-icons {
            display: flex;
            justify-content: flex-end; /* Align icons to the right */
            align-items: center;
            margin-top: 1rem;

            svg {
                width: 32px; /* Increase icon size */
                height: 32px; /* Increase icon size */
                margin: 0 1.5rem; /* Adjust spacing between icons */
            }
        }
    }
`;

const Header = () => {
    return (
        <HeaderStyled>
            <div className="header-content">
                <Navigation />
                <HeaderContent />
            </div>
        </HeaderStyled>
    );
};

const PrimaryButton = ({name}) => {
    return (
        <ButtonStyled>
            {name}
        </ButtonStyled>
    );
};

const Navigation = () => {
    return (
        <Fade top>
            <NavigationStyled>
                <div className="logo">
                    <img src={logo} alt="VeryCert Logo"/>
                </div>
                <ul>
                    <li><a href="#home">Home</a></li>
                </ul>
                <PrimaryButton name={'Sign Up'} />
            </NavigationStyled>
        </Fade>
    );
};

const HeaderContent = () => {
    return (
        <HeaderContentStyled>
            <Fade left cascade>
            <div className="left-content">
                <div className="left-text-container">
                    <h1>Securing your digital future.</h1>
                    <p className="white">
                    Welcome to VeryCert, where security meets simplicity. We specialize in secure digital 
                    certificate management, offering streamlined solutions for businesses and individuals. 
                    </p>
                    <AnimatedButton name={'Register Now'}/>
                </div>
            </div>
            </Fade>
            <Fade right>
            <div className="right-content">
                <img src={phone} alt="" className="phone"/>
                <img src={ring1} alt="" className="ring1"/>
                <img src={message1} alt="" className="message1"/>
                <img src={message2} alt="" className="message2"/>
            </div>
            </Fade>
        </HeaderContentStyled>
    );
};

const AnimatedButton = ({name}) => {
    return (
        <AnimatedButtonStyled>
            {name}
            <img src={arrow} alt="" className="arrow"/>
            <img src={blob1} alt="" className="blob1"/>
            <img src={blob2} alt="" className="blob2"/>
        </AnimatedButtonStyled>
    );
};

const CardSection = () => {
    return (
        <CardSectionStyled>
            <InnerLayout>
                <div className="card-container">
                    <div className="card-left">
                        <h2 className="secondary-heading">
                            Automate Certificate Renewals with VeryCert
                        </h2>
                        <p>
                        "VeryCert streamlines certificate management with its automated renewal feature. 
                        Users can set up automated processes for certificate renewal, ensuring seamless 
                        continuity of security protocols without manual intervention. This feature not 
                        only saves time but also enhances security by ensuring certificates are always 
                        up to date, maintaining compliance with industry standards effortlessly."
                        </p>
                    </div>
                    <div className="card-right">
                        <img src={card} alt="" />
                    </div>
                </div>
            </InnerLayout>
        </CardSectionStyled>
    );
};

const ChartStats = ({category, count}) => {
    return (
        <ChartStatsStyled >
            <p><b>{category}</b></p>
            <h4>{count}</h4>
        </ChartStatsStyled >
    )
}
const ChartSection = () => {
    return (
        <ChartStyled >
            <InnerLayout>
                <div className="chart-con">
                    <div className="chart-left">
                        <div className="stats">
                            <div className="stats-certificate">
                                <ChartStats category={'Certificates generated'} count={'1,000+'} />
                                <ChartStats category={'CA generated'} count={'250+'} />
                            </div>
                            <img src={chart} alt="" />
                        </div>
                    </div>
                    <div className="chart-right">
                        <h2 className="secondary-heading">
                        Simplify Certificate Management with VeryCert
                        </h2>
                        <Roll right>
                        <p>
                            VeryCert streamlines Public Key Infrastructure (PKI) certificate management 
                            from creation to renewal and revocation. Manage Certificate Authorities, sign 
                            requests, and ensure security compliance effortlessly.
                        </p>
                        </Roll>
                        <Bounce right>
                            <AnimatedButton name={'Learn More'} />
                        </Bounce>
                    </div>
                </div>
            </InnerLayout>
        </ChartStyled >
    );
};

const Footer = () => {
    return (
        <FooterStyled>
            <InnerLayout>
                <div className="footer-con">
                    <div className="top-section">
                        <div className="logo-con">
                            <img src={logo} alt="VeryCert Logo" />
                            <p>
                                Copyright @2024 VeryCert <br />
                                All rights reserved.
                            </p>
                        </div>
                        <ul className="button-nav">
                            <li>
                                <a href="#">Team</a>
                            </li>
                            <li>
                                <a href="#">Services</a>
                            </li>
                            <li>
                                <a href="#">Terms of use</a>
                            </li>
                        </ul>
                    </div>
                    <div className="social-icons">
                        <InstagramIcon style={{ color: 'black' }} />
                        <TwitterIcon style={{ color: 'black' }} />
                        <FacebookIcon style={{ color: 'black' }} />
                        <LinkedInIcon style={{ color: 'black' }} />
                    </div>
                </div>
            </InnerLayout>
        </FooterStyled>
    );
};

const App = () => {
    return (
        <div>
            <GlobalStyle />
            <MainStyled>
                <Header />
                <OuterLayout>
                    <Fade left><CardSection /></Fade>
                    <Fade right><ChartSection /></Fade>
                </OuterLayout>
                <Fade bottom><Footer /></Fade>
            </MainStyled>
        </div>
    );
};

export default App;
