import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewUserCard from '../cards/NewUserCard'; // Adjust the import according to your file structure
import useRegisterUser from '../../hooks/useRegisterUser';
import '@testing-library/jest-dom'

// Mock the useRegisterUser hook
jest.mock('../../hooks/useRegisterUser');

describe('NewUserCard', () => {
    let closeCardMock, onRegisterMock, setSuccessMessageMock, setErrorMessageMock;

    beforeEach(() => {
        // Create mocks for the props
        closeCardMock = jest.fn();
        onRegisterMock = jest.fn();
        setSuccessMessageMock = jest.fn();
        setErrorMessageMock = jest.fn();

        // Set up the mock for useRegisterUser
        useRegisterUser.mockReturnValue({
            registerUser: jest.fn().mockResolvedValue({ data: true }),
            loading: false,
            error: null,
        });
    });

    test('renders correctly when open', () => {
        render(
            <NewUserCard
                isOpen={true}
                closeCard={closeCardMock}
                onRegister={onRegisterMock}
                setSuccessMessage={setSuccessMessageMock}
                setErrorMessage={setErrorMessageMock}
            />
        );

        expect(screen.getByText('Nuevo Usuario')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Nombre de usuario')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Correo')).toBeInTheDocument();
    });

    test('calls closeCard when clicking outside of the card', () => {
        const { container } = render(
            <NewUserCard
                isOpen={true}
                closeCard={closeCardMock}
                onRegister={onRegisterMock}
                setSuccessMessage={setSuccessMessageMock}
                setErrorMessage={setErrorMessageMock}
            />
        );

        fireEvent.mouseDown(document);
        expect(closeCardMock).toHaveBeenCalledTimes(1);
    });

    test('handles user registration successfully', async () => {
        render(
            <NewUserCard
                isOpen={true}
                closeCard={closeCardMock}
                onRegister={onRegisterMock}
                setSuccessMessage={setSuccessMessageMock}
                setErrorMessage={setErrorMessageMock}
            />
        );
    
        // Fill the input fields
        fireEvent.change(screen.getByPlaceholderText('Nombre de usuario'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByPlaceholderText('Correo'), { target: { value: 'test@example.com' } });
    
        // Select a role
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'admin' } });
    
        // Click the save button
        fireEvent.click(screen.getByText('Guardar'));
    
        // Wait for assertions
        await waitFor(() => {
            expect(setSuccessMessageMock).toHaveBeenCalledWith('Usuario registrado con exito');
            expect(onRegisterMock).toHaveBeenCalledWith({
                username: 'testuser',
                password: 'password123',
                email: 'test@example.com',
                role: 'admin', // Ensure the role is 'admin'
            });
            expect(setErrorMessageMock).toHaveBeenCalledWith('');
        });
    });

    test('handles registration error', async () => {
        // Set the mock to return an error
        useRegisterUser.mockReturnValue({
            registerUser: jest.fn().mockResolvedValue({ error: true }),
            loading: false,
            error: null,
        });

        render(
            <NewUserCard
                isOpen={true}
                closeCard={closeCardMock}
                onRegister={onRegisterMock}
                setSuccessMessage={setSuccessMessageMock}
                setErrorMessage={setErrorMessageMock}
            />
        );

        // Fill the input fields
        fireEvent.change(screen.getByPlaceholderText('Nombre de usuario'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByPlaceholderText('Correo'), { target: { value: 'test@example.com' } });

        // Click the save button
        fireEvent.click(screen.getByText('Guardar'));

        // Wait for assertions
        await waitFor(() => {
            expect(setErrorMessageMock).toHaveBeenCalledWith('Error al registrar el usuario');
            expect(setSuccessMessageMock).toHaveBeenCalledWith('');
        });
    });
});
