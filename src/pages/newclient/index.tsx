"use client"
import Head from "next/head";
import { Header } from "@/components/Header";
import styles from './styles.module.scss';
import { canSSRAuth } from "@/utils/canSSRAuth";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { setupAPIClient } from "@/services/api";
import { useListOpen } from "@/providers/ListOpenContext";
import ptBR from 'date-fns/locale/pt-BR';
import DatePicker, { registerLocale } from 'react-datepicker';
import router from "next/router";

registerLocale("ptBR", ptBR);

export default function NewClient() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [cpf, setCpf] = useState('');
    const [telefone, setTelefone] = useState('');
    const [endereco, setEndereco] = useState('');
    const [dataV, setDataV] = useState('');
    const [valor, setValor] = useState('00.00');
    const [valorMask, setValorMask] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [planoFamiliar, setPlanoFamiliar] = useState('');
    const [tipoPacote, setTipoPacote] = useState('Mensal');
    const [situacao, setSituacao] = useState(true);
    const [camposFaltando, setCamposFaltando] = useState<string[]>([]);

    const maskMoney = (value: string) => {      
      const numericValue = value.replace(/\D/g, '');
      const formattedValue = numericValue.replace(/(\d)(\d{2})$/, '$1.$2');
      const valueWithDot = formattedValue.replace(/(?=(\d{3})+(\D))\B/g, '');
      return `R$ ${valueWithDot}`;      
    };
  
    const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;      
        const numericValue = rawValue.replace(/[^\d,.]/g, '');  
        const valueWithDot = numericValue.replace(/,/g, '.');
        const formattedValueWithSymbol = maskMoney(valueWithDot);  
        const formattedValue = formattedValueWithSymbol.substring(2);

        setValor(formattedValue); 
        setValorMask(formattedValueWithSymbol);                   
    };     
      
    async function handleRegister(event: FormEvent) {
      event.preventDefault();
      const camposFaltando: string[] = [];

      if (name === '') camposFaltando.push('Nome');
      if (email === '') camposFaltando.push('Email');
      if (cpf === '') camposFaltando.push('CPF');
      if (telefone === '') camposFaltando.push('Telefone');
      if (endereco === '') camposFaltando.push('Endereço');
      if (quantidade === '') camposFaltando.push('Quantidade de Sessões');

      if (camposFaltando.length > 0) {
        camposFaltando.forEach((campo) => {
          toast.error(`O campo '${campo}' é obrigatório.`);
      });
        
        return;
      }

        try {
                    
          let situacaoPacote = true;
          if (tipoPacote === 'Mensal') {
              const isBeforeOrEqualToday = selectedDate && selectedDate <= new Date();
              situacaoPacote = !isBeforeOrEqualToday;
          }
          const formattedDataVencimento = tipoPacote === 'Mensal' ? (selectedDate ? selectedDate.toLocaleDateString('pt-BR') : null) : null;      
          const requestData = {
            name,
            email,
            cpf,
            telefone,
            endereco,
            dataVencimento: formattedDataVencimento,
            valorPlano: parseFloat(valor),
            quantidadeSessoes: parseInt(quantidade, 10),
            situacao: situacaoPacote,
          };    
          const apiClient = setupAPIClient();
          await apiClient.post('/client', requestData);          
          router.push('/caixa');    
          toast.success('Cliente cadastrado com sucesso');
        } catch (err) {
          if (err instanceof Error) {
            toast.error(err.message);
          } else {
            toast.error('Erro ao cadastrar');
          }
        }
        setCamposFaltando([]);    
        setName('');
        setEmail('');
        setCpf('');
        setTelefone('');
        setDataV('');
        setValorMask('');
        setEndereco('');
        setQuantidade('');
    }

      const {listOpen} = useListOpen();
      const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
      const [isDatePickerOpen, setDatePickerOpen] = useState(false);
      const handleDateChange = (date: Date | null) => {
      setSelectedDate(date);
    };

    useEffect(() => {
      const isBeforeOrEqualToday = selectedDate && selectedDate <= new Date();
      setSituacao((prevState) => !isBeforeOrEqualToday);
    }, [selectedDate]);

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value.replace(/\D/g, "");
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d{2})$/, "$1-$2");
      setCpf(value);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value.replace(/\D/g, "");
      value = value.replace(/(\d{2})(\d)/, "($1) $2");
      value = value.replace(/(\d{4})(\d)/, "$1-$2");
      setTelefone(value);
    };

    return(
        <>
        <Head>
            <title>Novo Cliente - ConsultEasy</title>
        </Head>
        <div>
            <Header/>
            {listOpen ? <></> : 
            <main className={styles.container}>
                <h1>Novo Cliente</h1>

                <form className={styles.form} onSubmit={handleRegister}>
                    <input 
                        type="text"
                        placeholder="Nome"
                        value={name}
                        onChange={(e) => setName(e.target.value)} 
                    />

                    <input 
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}  
                    />

                    <input 
                        onChange={handleCpfChange}
                        maxLength={14}
                        placeholder="CPF"
                        value={cpf}  
                    />

                    <input 
                        placeholder="Telefone"
                        value={telefone}
                        onChange={handlePhoneChange}
                        maxLength={15} 
                    />

                    <input 
                        type="text"
                        placeholder="Endereço"
                        value={endereco}
                        onChange={(e) => setEndereco(e.target.value)}  
                    />
                     
                      <DatePicker
                        selected={selectedDate}
                        onChange={handleDateChange}
                        minDate={new Date()} 
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Informe a data"
                        showYearDropdown
                        yearDropdownItemNumber={15}
                        scrollableYearDropdown
                        className={`${styles.datePicker} ${
                          isDatePickerOpen ? styles.datePickerOpen : ''
                        }`}
                        onFocus={() => setDatePickerOpen(true)}
                        onBlur={() => setDatePickerOpen(false)}
                        open={isDatePickerOpen}
                        locale="ptBR"
                      />                                   
                                      
                    {planoFamiliar === 'Dependente' ? <></>: 

                      <input
                        placeholder="Valor plano"
                        value={valorMask}
                        onChange={handleValorChange}
                      />
                    }

                    <input 
                        type="number"
                        placeholder="Quantidade de consultas"
                        value={quantidade}
                        onChange={(e) => setQuantidade(e.target.value)}  
                    />

                    <button className={styles.buttonAdd} type="submit">
                        Cadastrar
                    </button>
                </form>
            </main>
            }
        </div>
        </>
    )
}

export const getServerSideProps = canSSRAuth(async (ctx) => {
    return {
        props: {}
    };
});
