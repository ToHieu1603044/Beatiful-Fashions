import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col } from "react-bootstrap";


const Carousel = () => {
    const [slides, setSlides] = useState([]);
    const [banner, setBanner] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    // Placeholder image (you can use a low-res or blurred image URL)
    const placeholderImage = "https://via.placeholder.com/1200x400?text=Loading..."; 
    const placeholderBanner = "https://via.placeholder.com/400x600?text=Loading..."; 

    const fetchSlide = async () => {
        try {
            const { data } = await axios.get("http://127.0.0.1:8000/api/slide-banner");

            const [{ banners: [{ banners = [] } = {}], images = [], title, description }] = data.slides || [];

            const flattenedSlides = images.map((image, index) => ({
                id: `slide-0-${index}`,
                image,
                title,
                description,
            }));

            console.log("Banners fetched: ", banners);
            console.log("Slides fetched: ", flattenedSlides);

            setBanner(banners);
            setSlides(flattenedSlides);
            setIsLoading(false); 
        } catch (error) {
            console.log("Error fetching slides: ", error);
            setIsLoading(false); 
        }
    };

    useEffect(() => {
        fetchSlide();
    }, []);

    useEffect(() => {
        if (slides.length > 0) {
            const interval = setInterval(() => {
                setActiveIndex((prevIndex) => (prevIndex + 1) % slides.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [slides.length]);

    const nextSlide = () => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % slides.length);
    };

    const prevSlide = () => {
        setActiveIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
    };

    if (isLoading) {
        return (
            <div>
                {/* Placeholder Carousel Section */}
                <div
                    id="carouselExampleIndicators"
                    className="carousel slide"
                    data-bs-ride="carousel"
                >
                    <div className="carousel-inner">
                        <div className="carousel-item active">
                            <div className="placeholder-blur">
                                <img
                                    src={placeholderImage}
                                    className="d-block w-100"
                                    alt="Loading placeholder"
                                    style={{ objectFit: "cover", height: "400px" }}
                                />
                            </div>
                            <div className="carousel-caption d-none d-md-block">
                                <h5>Loading...</h5>
                                <p>Please wait while content loads.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Placeholder Banner Section */}
                <Container className="mt-4">
                    <Row>
                        <Col md={4} className="mb-3">
                            <div className="placeholder-blur">
                                <img
                                    src={placeholderBanner}
                                    alt="Banner placeholder"
                                    className="img-fluid"
                                    style={{ height: "600px", objectFit: "cover", width: "100%" }}
                                />
                            </div>
                        </Col>
                        <Col md={4} className="mb-3">
                            <div className="placeholder-blur">
                                <img
                                    src={placeholderBanner}
                                    alt="Banner placeholder"
                                    className="img-fluid"
                                    style={{ height: "300px", objectFit: "cover", width: "100%" }}
                                />
                            </div>
                            <div className="placeholder-blur mt-2">
                                <img
                                    src={placeholderBanner}
                                    alt="Banner placeholder"
                                    className="img-fluid"
                                    style={{ height: "300px", objectFit: "cover", width: "100%" }}
                                />
                            </div>
                        </Col>
                        <Col md={4} className="mb-3">
                            <div className="placeholder-blur">
                                <img
                                    src={placeholderBanner}
                                    alt="Banner placeholder"
                                    className="img-fluid"
                                    style={{ height: "600px", objectFit: "cover", width: "100%" }}
                                />
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }

    if (slides.length === 0) {
        return <div>No slides available</div>;
    }

    return (
        <div>
            {/* Carousel Section */}
            <div
                id="carouselExampleIndicators"
                className="carousel slide"
                data-bs-ride="carousel"
            >
                <div className="carousel-indicators">
                    {slides.map((slide, index) => (
                        <button
                            key={slide.id}
                            type="button"
                            data-bs-target="#carouselExampleIndicators"
                            data-bs-slide-to={index}
                            className={activeIndex === index ? "active" : ""}
                            aria-current={activeIndex === index ? "true" : "false"}
                            aria-label={`Slide ${index + 1}`}
                            onClick={() => setActiveIndex(index)}
                        />
                    ))}
                </div>

                <div className="carousel-inner">
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={`carousel-item ${index === activeIndex ? "active" : ""}`}
                        >
                            <img
                                src={slide.image ?? placeholderImage}
                                className="d-block w-100"
                                alt={`Slide ${index + 1}`}
                                style={{ objectFit: "cover", height: "400px" }}
                            />
                            <div className="carousel-caption d-none d-md-block">
                                <h5>{slide.title}</h5>
                                <p>{slide.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    className="carousel-control-prev"
                    type="button"
                    onClick={prevSlide}
                    aria-label="Previous"
                >
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                </button>
                <button
                    className="carousel-control-next"
                    type="button"
                    onClick={nextSlide}
                    aria-label="Next"
                >
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                </button>
            </div>

            {/* Banner Section */}
            <Container className="mt-4">
                <Row>
                    {banner.length > 0 && (
                        <Col md={4} className="mb-3">
                            <img
                                src={banner[0]}
                                alt="Banner 1"
                                className="img-fluid"
                                style={{ height: "600px", objectFit: "cover", width: "100%" }}
                            />
                        </Col>
                    )}
                    <Col md={4} className="mb-3">
                        {banner.length > 1 && (
                            <img
                                src={banner[1]}
                                alt="Banner 2"
                                className="img-fluid"
                                style={{ height: "300px", objectFit: "cover", width: "100%" }}
                            />
                        )}
                        {banner.length > 2 && (
                            <img
                                src={banner[2]}
                                alt="Banner 3"
                                className="img-fluid mt-2"
                                style={{ height: "300px", objectFit: "cover", width: "100%" }}
                            />
                        )}
                    </Col>
                    {banner.length > 3 && (
                        <Col md={4} className="mb-3">
                            <img
                                src={banner[3]}
                                alt="Banner 4"
                                className="img-fluid"
                                style={{ height: "600px", objectFit: "cover", width: "100%" }}
                            />
                        </Col>
                    )}
                </Row>
            </Container>
        </div>
    );
};

export default Carousel;