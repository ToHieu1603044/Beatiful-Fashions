import React, { useState } from 'react';

const Post = () => {
  const [modalContent, setModalContent] = useState('');

  const openModal = (content: string) => {
    setModalContent(content);
    const modal = new window.bootstrap.Modal(document.getElementById('textModal'));
    modal.show();
  };

  return (
    <div className="container py-5">
      <div className="row g-4">
        {/* Card 1: Essential Basics */}
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm">
            <img
              src="https://via.placeholder.com/400x500?text=Essential+Basics"
              alt="Essential Basics"
              className="card-img-top"
            />
            <div className="card-body text-center">
              <p className="card-text text-uppercase text-muted mb-1">Up to 30% off</p>
              <h5 className="card-title fw-bold">Essential Basics</h5>
              <button
                onClick={() => openModal('Explore our collection of Essential Basics with up to 30% off!')}
                className="btn btn-outline-dark mt-2"
              >
                Shop now
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Athleisure Wear */}
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm">
            <img
              src="https://via.placeholder.com/400x500?text=Athleisure+Wear"
              alt="Athleisure Wear"
              className="card-img-top"
            />
            <div className="card-body text-center">
              <p className="card-text text-uppercase text-muted mb-1">Up to 30% off</p>
              <h5 className="card-title fw-bold">Athleisure Wear</h5>
              <button
                onClick={() => openModal('Check out our Athleisure Wear collection with up to 30% off!')}
                className="btn btn-outline-dark mt-2"
              >
                Shop now
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Seasonal Favorites */}
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm">
            <img
              src="https://via.placeholder.com/400x500?text=Seasonal+Favorites"
              alt="Seasonal Favorites"
              className="card-img-top"
            />
            <div className="card-body text-center">
              <p className="card-text text-uppercase text-muted mb-1">Up to 30% off</p>
              <h5 className="card-title fw-bold">Seasonal Favorites</h5>
              <button
                onClick={() => openModal('Discover our Seasonal Favorites with up to 30% off!')}
                className="btn btn-outline-dark mt-2"
              >
                Shop now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bootstrap Modal */}
      <div className="modal fade" id="textModal" tabIndex={-1} aria-labelledby="textModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="textModalLabel">Collection Details</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">{modalContent}</div>
            <div className="modal-footer">
              <button type="button" className="btn btn-danger" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;