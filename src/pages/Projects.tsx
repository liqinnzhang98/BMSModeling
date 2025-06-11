import React, { useEffect, useCallback, useState } from 'react';
import axios from 'axios';

const Projects: React.FC = () => {
    const [projects, setProjects] = useState([]);

    const fetchProjects = useCallback(async () => {
        try {
            const { data } = await axios.get('/api/projects');
            setProjects(data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    return (
        // ... rest of the component code ...
    );
};

export default Projects; 