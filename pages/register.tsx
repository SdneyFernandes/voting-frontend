import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { api } from '@/services/api';
import { RegisterRequest, Role } from '@/types';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';


export default function Register() {
const [form, setForm] = useState<RegisterRequest>({
userName: '',
email: '',
password: '',
role: 'USER'
});
const [errors, setErrors] = useState({
userName: '',
email: '',
password: '',
general: ''
});
const [isLoading, setIsLoading] = useState(false);
const [isSuccess, setIsSuccess] = useState(false);
const [floatingShapes, setFloatingShapes] = useState<Array<{left: string, top: string, size: string}>>([]);
const formRef = useRef<HTMLFormElement>(null);
const router = useRouter();


useEffect(() => {
const shapes = Array(8).fill(0).map(() => ({
left: `${Math.random() * 80 + 10}%`,
top: `${Math.random() * 80 + 10}%`,
size: `${Math.random() * 20 + 10}px`
}));
setFloatingShapes(shapes);
}, []);


const validateForm = () => {
let valid = true;
const newErrors = { userName: '', email: '', password: '', general: '' };


if (!form.userName.trim()) {
newErrors.userName = 'Nome é obrigatório';
valid = false;
} else if (form.userName.length < 3) {
newErrors.userName = 'Nome deve ter pelo menos 3 caracteres';
valid = false;
}


if (!form.email.trim()) {
newErrors.email = 'Email é obrigatório';
valid = false;
} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
newErrors.email = 'Email inválido';
valid = false;
}


if (!form.password) {
newErrors.password = 'Senha é obrigatória';
valid = false;
} else if (form.password.length < 6) {
</div>
            
           {/* O campo de seleção de Role foi removido pois o padrão é sempre USER */}
{/* <div className="input-group">
    <select 
        onChange={e => setForm({ ...form, role: e.target.value as Role })} 
        className="input-field"
        required
    >
        <option value="USER">Usuário</option>
        <option value="ADMIN">Administrador</option>
    </select>
    <span className="input-highlight"></span>
</div>
*/} 
            
            <button type="submit" className="register-button" disabled={isLoading}>
{isLoading ? <span className="button-loader"></span> : 'CRIAR CONTA'}
<span className="button-border"></span>
</button>
</form>
          
          <div className="footer-links">
<p>Já tem uma conta? <Link href="/" className="link">Faça login</Link></p>
</div>
        </div>
      </div>
      
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes success-pulse {
          0% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(46, 204, 113, 0); }
          100% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0); }
        }
        
        .shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        
        .success-pulse {
          animation: success-pulse 1s ease;
        }
      `}</style>
      
      <style jsx>{`
        .register-container {
          position: relative;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          overflow: hidden;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
        }
        
        .grid-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          opacity: 0.2;
        }
        
        .floating-shapes {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .floating-shapes .shape {
          position: absolute;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: float 15s ease-in-out infinite;
          filter: blur(0.5px);
          opacity: 0.7;
        }
        
        .register-content {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          background: rgba(10, 10, 10, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 3rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          border: 1px solid #333;
          animation: slideIn 0.8s ease-out;
        }
        
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .brand-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .logo-wrapper {
          position: relative;
          display: inline-block;
          margin-bottom: 1rem;
        }
        
        .logo {
          font-size: 2.5rem;
          font-weight: 800;
          letter-spacing: 2px;
          background: linear-gradient(90deg, #fff, #999);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          position: relative;
        }
        
        .logo::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, #999, transparent);
        }
        
        .tagline {
          color: #777;
          font-size: 0.9rem;
          letter-spacing: 1px;
        }
        
        .register-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .input-group {
          position: relative;
          margin-bottom: 1.5rem;
        }
        
        .input-field {
          width: 100%;
          padding: 1rem 1rem 1rem 0;
          background: transparent;
          border: none;
          border-bottom: 1px solid #444;
          color: #e0e0e0;
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        
        .input-field.error {
          border-bottom-color: #ff4444;
        }
        
        .input-field:focus {
          outline: none;
          border-bottom-color: #fff;
        }
        
        .input-field.error:focus {
          border-bottom-color: #ff4444;
        }
        
        .input-field::placeholder {
          color: #555;
        }
        
        select.input-field {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23777'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 0.5rem center;
          background-size: 1.5rem;
          padding-right: 2.5rem;
        }
        
        .input-highlight {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: #fff;
          transition: width 0.3s ease;
        }
        
        .input-field:focus ~ .input-highlight {
          width: 100%;
        }
        
        .input-field.error:focus ~ .input-highlight {
          background: #ff4444;
        }
        
        .error-text {
          position: absolute;
          bottom: -1.2rem;
          left: 0;
          color: #ff4444;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }
        
        .error-message {
          background-color: rgba(255, 68, 68, 0.1);
          color: #ff4444;
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          border: 1px solid rgba(255, 68, 68, 0.3);
          text-align: center;
        }
        
        .success-message {
          background-color: rgba(46, 204, 113, 0.1);
          color: #2ecc71;
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          border: 1px solid rgba(46, 204, 113, 0.3);
          text-align: center;
        }
        
        .register-button {
          position: relative;
          padding: 1rem;
          background: #1a1a1a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.3s ease;
          overflow: hidden;
          margin-top: 1rem;
        }
        
        .register-button:hover {
          background: #222;
        }
        
        .register-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .button-border {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          pointer-events: none;
        }
        
        .button-loader {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          border-top-color: #fff;
          animation: rotate 1s ease-in-out infinite;
          margin: 0 auto;
        }
        
        .footer-links {
          text-align: center;
          margin-top: 2rem;
          color: #777;
          font-size: 0.9rem;
        }
        
        .link {
          color: #999;
          text-decoration: none;
          transition: color 0.3s ease;
          font-weight: 600;
        }
        
        .link:hover {
          color: #fff;
        }

        @media (max-width: 600px) {
  .register-container {
    padding: 0.5rem;
  }

  .register-content {
    padding: 1.5rem 1rem;
    max-width: 100%;
    box-shadow: none;
    border-radius: 10px;
  }

  .brand-header {
    margin-bottom: 2rem;
  }

  .logo {
    font-size: 1.4rem;
  }

  .register-form {
    gap: 0.75rem;
  }

  .footer-links {
    margin-top: 1.2rem;
    font-size: 0.95rem;
  }
}


      `}</style>
    </>
  );
}