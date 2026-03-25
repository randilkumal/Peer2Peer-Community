import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ExpertSessionHistory() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/expert/joined-sessions?tab=completed', { replace: true });
  }, [navigate]);
  return null;
}
