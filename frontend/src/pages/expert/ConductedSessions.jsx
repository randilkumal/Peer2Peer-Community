import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ExpertConductedSessions() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/expert/joined-sessions?tab=completed&sub=conducted', { replace: true });
  }, [navigate]);
  return null;
}
