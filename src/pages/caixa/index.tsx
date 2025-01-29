"use client"
import Head from "next/head";
import { Header } from "../../components/Header";
import styles from './styles.module.scss';
import { canSSRAuth } from "../../utils/canSSRAuth";
import { setupAPIClient } from "@/services/api";
import { useEffect, useState } from "react";
import { HiUsers } from "react-icons/hi";
import { MdDateRange, MdCoPresent } from "react-icons/md";
import { SiCashapp } from "react-icons/si";
import { toast } from "react-toastify";

interface Client {
  id: string;
  name: string;
  valorPlano: string;
  valorAberto: string;
  situacao: boolean;
}
interface Caixa {
  id: string;
  valorPlano: string;
  valorAberto: string;
  dataOperacao: Date;
  client_id: string;
}

export default function Caixa() {
  const [clients, setClients] = useState<Client[]>([]);
  const [caixa, setCaixa] = useState<Caixa[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);  
  const [valorMask, setValorMask] = useState('');
  const [valor, setValor] = useState('');
  const [valorEmAberto, setValorEmAberto] = useState('R$ 0,00');  
  const [valorPlano, setValorPlano] = useState<Number>();  
  
  const calcularValorEmAberto = async (clientId: string) => {
    try {
      const apiClient = setupAPIClient();
      const response = await apiClient.get(`/caixa/latest/${clientId}`);
      const latestCaixa = response.data;
      
      if (latestCaixa) {
        let valorAberto = parseFloat(latestCaixa.valorAberto);
        setValorEmAberto(`R$ ${valorAberto.toFixed(2)}`);  
        const responseClient = await apiClient.get(`/client/detail/${clientId}`);
        const clientDetails = responseClient.data;
        const situacaoCliente = clientDetails.situacao;
        setSelectedClient({ ...selectedClient!,situacao: situacaoCliente, id: clientId, valorPlano: latestCaixa.valorPlano });
      } else {
        setValorEmAberto('R$ 0.00');
      }

    } catch (error) {
      toast.error("Erro ao buscar saldo do cliente!");
    }
  };  

  const fetchClients = async () => {
    try {
      const apiClient = setupAPIClient();
      const response = await apiClient.get("/clientlist");
      setClients(response.data);
    } catch (error) {
      toast.error('Erro ao buscar clientes cadastrados!');
    }
  };

  const fetchCaixa = async () => {
    try {
      const apiClient = setupAPIClient();
      const response = await apiClient.get("/caixalist");
      setCaixa(response.data);
    } catch (error) {
      toast.error('Erro ao buscar lançamentos!');
    }
  };
  
  const fetchClientDetails = async (clientId: string) => {
    try {
      const apiClient = setupAPIClient();
      const response = await apiClient.get(`/client/detail/${clientId}`);
      const clientDetails = response.data;
      const valorAberto = parseFloat(clientDetails.valorAberto);
      const valorPlanoFloat = parseFloat(clientDetails.valorPlano);
      const situacaoCliente = clientDetails.situacao;
      setSelectedClient({ ...clientDetails, situacao: situacaoCliente, valorPlano: valorPlanoFloat.toFixed(2) });
      setValorPlano(valorPlanoFloat);
      calcularValorEmAberto(clientId);
    } catch (error) {
      toast.error('Erro ao buscar detalhes do cliente!');
    }
  };
  
  useEffect(() => {
    fetchCaixa();
  }, []);  
  useEffect(() => {
    fetchClients();
  }, []);  
  useEffect(() => {
    if (selectedClientId) {
      fetchClientDetails(selectedClientId);
    }
  }, [selectedClientId]); 
  
  useEffect(() => {
    if (selectedClient) {
    }
  }, [selectedClient]);   

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
  const handleLancamento = async () => {
    try {
      if (!selectedClientId || valor === '') {
        toast.warning('Preencha todos os campos!');
        return;
      }

      const apiClient = setupAPIClient(); 
      await apiClient.post('/lancamento', {
        client_id: selectedClientId,
        valorPago: parseFloat(valor),
      });
      toast.success('Lançamento bem-sucedido!');

      setSelectedClientId('');
      setSelectedClient(null);
      setValorEmAberto('');
      setValorMask('');
      setSelectedClient({
        id: '',
        name: '',
        valorPlano: '0.00',
        valorAberto: '0.00',
        situacao: true,
      });
    } catch (error) {
      toast.error('Erro ao realizar o lançamento');
    }
  };
  
  const formatarDataAtual = () => {
    const dataAtual = new Date();
    const dia = String(dataAtual.getDate()).padStart(2, '0');
    const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
    const ano = dataAtual.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };
  const textoSituacao = () => {    
    if(selectedClient?.situacao == true){
      return 'Pago';
    }else{
      return 'Vencido'
    }
  }; 

  return (
    <>
      <Head>
        <title>Caixa - ConsultEasy</title>
      </Head>
      <div>
        <Header />
        <main className={styles.container}>

          <div className={styles.containerHeader}>
            <h1>$ Caixa</h1>
          </div>

          <div className={styles.containerCaixa}>
            <div className={styles.tag}></div>
            <form className={styles.formCaixa} onSubmit={(e) => e.preventDefault()}>

              <div className={styles.selectClient}>
                <HiUsers size={25} className={styles.iconsInput} />
                Nome do Cliente:
                <select
                  value={selectedClientId}
                  onChange={(e) => {
                    setSelectedClientId(e.target.value);
                    fetchClientDetails(e.target.value);
                  }}
                >
                  <option value="">Selecione o cliente</option>
                  {clients
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className={styles.itemsForm}>
                <MdDateRange size={25} className={styles.iconsInput} />
                <span>Data atual: <strong>{formatarDataAtual()}</strong></span>
              </div>

              <div className={styles.itemsForm}>
                <SiCashapp size={25} className={styles.iconsInput} />
                <span>Valor do plano: </span>
                <input
                  type="text"
                  placeholder="Valor do Plano"
                  className={styles.inputContainerDisable}
                  value={selectedClient ? `R$ ${(valorPlano?.toFixed(2))}` : 'R$ 0,00'}
                  readOnly
                />
              </div>

              <div className={styles.itemsForm}>
                <SiCashapp size={25} className={styles.iconsInput} />
                <span>Saldo do cliente: </span>
                <input
                  type="text"
                  placeholder="Valor em Aberto"
                  className={styles.inputContainerDisable}
                  value={valorEmAberto}
                  readOnly
                />
              </div>

              <div className={styles.itemsForm}>
                <MdCoPresent size={25} className={styles.iconsInput} />
                <span>Situação: </span>
                <input
                  type="text"
                  placeholder="Situação"
                  className={styles.inputContainerDisable}
                  value={textoSituacao()}
                  readOnly
                />
              </div>

              <div className={styles.itemsForm}>
                <SiCashapp size={25} className={styles.iconsInput} />
                <span>Valor pago: </span>
                <input
                  placeholder="Valor pago"
                  value={valorMask}
                  onChange={handleValorChange}
                  className={styles.inputContainer}
                />
              </div>              

              <button className={styles.buttonConfirm} type="button" onClick={handleLancamento}>
                Efetuar lançamento
              </button>
            </form>
          </div>

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
