import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Typography,
    Button,
    Paper,
    Box,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import axios from 'axios';

const ProjectDetail: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({});

    const fetchProject = useCallback(async () => {
        try {
            const { data } = await axios.get(`/api/project/${id}`);
            setProject(data);
        } catch (error) {
            console.error('Error fetching project:', error);
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('/api/controller', formData);
            setOpen(false);
            fetchProject();
        } catch (error) {
            console.error('Error creating controller:', error);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

    return (
        <div>
            {/* Rest of the component code */}
        </div>
    );
};

export default ProjectDetail; 