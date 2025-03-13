import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import cls1 from "../assets/cls-handbag1.jpg";
import cls2 from "../assets/cls-handbag2.jpg";

import cls3 from "../assets/cls-handbag3.jpg";

import cls4 from "../assets/cls-handbag4.jpg";



const ImageCollection = () => {
 return (
 <Container>
 <Row>
 <Col md={4}>
 <img
 src={cls1} // Replace with your image URL
 alt="Image 1"
 className="img-fluid"
 style={{ height: '600px', objectFit: 'cover' }} // Adjust height as needed
 />
 </Col>
 <Col md={4}>
 <img
 src={cls2} // Replace with your image URL alt="Image 2"
 className="img-fluid"
 style={{ height: '300px', objectFit: 'cover' }} // Adjust height as needed
 />
 <img
 src={cls3} // Replace with your image URL
 alt="Image 3"
 className="img-fluid mt-2" // Add margin-top for spacing
 style={{ height: '300px', objectFit: 'cover' }} // Adjust height as needed
 />
 </Col>
 <Col md={4}>
 <img
 src={cls4} 
 alt="Image 4"
 className="img-fluid"
 style={{ height: '600px', objectFit: 'cover' }} 
 />
 </Col>
 </Row>
 </Container>
 );
};


export default ImageCollection;
