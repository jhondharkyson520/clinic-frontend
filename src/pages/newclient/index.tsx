"use client"
import Head from "next/head";
import { Header } from "@/components/Header";
import styles from './styles.module.scss';
import { canSSRAuth } from "@/utils/canSSRAuth";
import { FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { setupAPIClient } from "@/services/api";
import InputMask from 'react-input-mask';
import { DateTime } from 'luxon';
import { useListOpen } from "@/providers/ListOpenContext";
import ptBR from 'date-fns/locale/pt-BR';
import DatePicker from 'react-datepicker';
import router from "next/router";



export default function NewClient(){

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
      
    useEffect(() => {
      console.log('situacao3:', situacao);
    }, [situacao]);

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
          // Formatar a data de vencimento para enviar ao servidor
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
          //console.error(err);
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

    const { listOpen } = useListOpen();

    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [isDatePickerOpen, setDatePickerOpen] = useState(false);

    const handleDateChange = (date: Date | null) => {
      setSelectedDate(date);
    };

    useEffect(() => {
      console.log('ConsultEasy');
      
    }, [selectedDate]);
    console.log(selectedDate);

    useEffect(() => {
      console.log(selectedDate);
    
      const isBeforeOrEqualToday = selectedDate && selectedDate <= new Date();
      console.log('isBeforeOrEqualToday:', isBeforeOrEqualToday);
      setSituacao((prevState) => !isBeforeOrEqualToday);
      console.log('situacao3:', !isBeforeOrEqualToday);
    }, [selectedDate]);    
    
    //const currentDate = new Date().toISOString().split('T')[0]; 

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

                    <InputMask 
                        mask="999.999.999-99" 
                        placeholder="CPF"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}  
                    />

                    <InputMask 
                        mask="(99) 99999-9999" 
                        placeholder="Telefone"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}  
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
                        placeholder="Quantidade de sessões"
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
