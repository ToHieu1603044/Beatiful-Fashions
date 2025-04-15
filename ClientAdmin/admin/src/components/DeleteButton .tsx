import React from 'react';
import { Button } from 'antd';
import { BsTrash } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

interface DeleteButtonProps {
  data?: any; 
  onClick?: () => void; 
  navigateTo: string; 
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ data, onClick, label, navigateTo }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(); 
    }
    navigate(navigateTo); 
  };

  return (
    <Button className="btn btn-danger mt-3" icon={<BsTrash />} onClick={handleClick}>
      {label}
    </Button>
  );
};

export default DeleteButton;
