"use client"
import Head from "next/head";
import { Header } from "@/components/Header";
import styles from './styles.module.scss';
import { canSSRAuth } from "@/utils/canSSRAuth";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { setupAPIClient } from "@/services/api";
import InputMask from 'react-input-mask-next';
import { useRouter } from "next/router";
import DatePicker, { registerLocale } from 'react-datepicker';
import { useListOpen } from "@/providers/ListOpenContext";
import ptBR from "date-fns/locale/pt-BR";

registerLocale("ptBR", ptBR);

interface Props {
  id: string;
}

export default function ClientEdit({ id }: Props){
  
    const [idClient, setIdClient] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [cpf, setCpf] = useState('');
    const [telefone, setTelefone] = useState('');
    const [endereco, setEndereco] = useState('');
    const [dataV, setDataV] = useState('');
    const [valor, setValor] = useState('');
    const [valorMask, setValorMask] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [situacao, setSituacao] = useState(false);
    const router = useRouter();

    
    useEffect(() => {      
      const clientId = router.query.id as string;
      if(!clientId) return;
      //setIdClient(clientId);
      //console.log(clientId); 
      const fetchClientData = async () => {
        try {
          const apiClient = setupAPIClient();
          const response = await apiClient(`/client/detail/${clientId}`);
          const clientData = response.data;
  
          setIdClient(clientId);        
          setName(clientData.name);
          setEmail(clientData.email);
          setCpf(clientData.cpf);
          setTelefone(clientData.telefone);
          setEndereco(clientData.endereco);
          setDataV(clientData.dataVencimento);
          if (clientData.dataVencimento) {
            setSelectedDate(new Date(clientData.dataVencimento));
          }
          setValorMask(clientData.valorPlano.toString());
          setValor(clientData.valorPlano.toString());
          setQuantidade(clientData.quantidadeSessoes);
          setSituacao(clientData.situacao);
          
        } catch (error) {
          toast.error('Erro ao buscar dados do cliente');          
        }
      };  
      fetchClientData();
    }, [router.query.id]);


    const maskMoney = (value: string) => {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 2) {
        return `R$ ${numericValue.padStart(3, '0').replace(/(\d)(\d{2})$/, '$1,$2')}`;
      }
      const formattedValue = numericValue.replace(/(\d)(\d{2})$/, '$1,$2').replace(/(?=(\d{3})+(\D))\B/g, '.');
      return `R$ ${formattedValue}`;
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

    async function handleUpdate(event: FormEvent) {
      event.preventDefault();          
      const camposFaltando: string[] = [];
      if (name === '') camposFaltando.push('Nome');
      if (email === '') camposFaltando.push('Email');
      if (cpf === '') camposFaltando.push('CPF');
      if (telefone === '') camposFaltando.push('Telefone');
      if (endereco === '') camposFaltando.push('Endereço');
      if (valorMask === '') camposFaltando.push('Valor do Plano');
      if (quantidade === '') camposFaltando.push('Quantidade de Sessões');    
      if (camposFaltando.length > 0) {
        camposFaltando.forEach((campo) => {
          toast.error(`O campo '${campo}' é obrigatório.`);
        });
        return;
      }
    
      try {        
        const dataVencimentoFormatted = selectedDate ? selectedDate.toLocaleDateString('pt-BR') : null;        
        const requestData = {
          id: idClient, 
          name,
          email,
          cpf,
          telefone,
          endereco,
          dataVencimento: dataVencimentoFormatted, 
          valorPlano: parseFloat(valor),
          quantidadeSessoes: parseInt(quantidade, 10),
          situacao,
        };    
        const apiClient = setupAPIClient();
        const response = await apiClient.put(`/client/update/${idClient}`, requestData); 
        toast.success('Cliente atualizado com sucesso');
        router.push('/clientlist');
      } catch (error) {
        //console.log('Erro ao atualizar cliente:', error);
        toast.error('Erro ao atualizar cliente');
      }
    }

    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [isDatePickerOpen, setDatePickerOpen] = useState(false);

    const handleDateChange = (date: Date | null) => {
      setSelectedDate(date);
    };

    useEffect(() => {
      setValor(valorMask);
    }, [selectedDate]);
    //console.log('teste', maskMoney(valor));
    const { listOpen } = useListOpen();

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
            <title>Editar cliente - ConsultEasy</title>
        </Head>
        <div>
            <Header/>

            <main className={styles.container}>
                <h1>Editar dados do Cliente</h1>

                <form className={styles.form}  onSubmit={handleUpdate}>
                      
                    
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
                        onChange={handlePhoneChange}
                        maxLength={15} 
                        placeholder="Telefone"
                        value={telefone}
                    />

                    <input 
                        type="text"
                        placeholder="Endereço"
                        value={endereco}
                        onChange={(e) => setEndereco(e.target.value)}  
                    />

                    {listOpen ? <></> : 
                      
                        <DatePicker
                          selected={selectedDate}
                          onChange={handleDateChange}
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
                                     
                    }

                      <input
                        placeholder="Valor plano"
                        value={valorMask}
                        onChange={handleValorChange}
                      />
                                    

                    <input 
                        type="number"
                        placeholder="Quantidade de consultas"
                        value={quantidade}
                        onChange={(e) => setQuantidade(e.target.value)}  
                    />

                    <button className={styles.buttonAdd} type="submit">
                        Atualizar
                    </button>
                </form>
            </main>
        </div>
        </>
    )
}

export const getServerSideProps = canSSRAuth(async (ctx) => {
    return {
        props: {}
    };
});
