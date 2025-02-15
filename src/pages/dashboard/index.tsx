"use client"
import Head from "next/head";
import { Header } from "../..//components/Header";
import styles from './styles.module.scss';
import { canSSRAuth } from "../..//utils/canSSRAuth";
import { FiRefreshCcw, FiSearch } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { setupAPIClient } from "@/services/api";
import { useEffect, useState } from "react";
import router from "next/router";
import { toast } from "react-toastify";
import { FaList } from "react-icons/fa";
import { TbBrandCashapp } from "react-icons/tb";
import { MdOutlinePayments } from "react-icons/md";
import { DateTime } from "luxon";

type AgendaItem = {
    id: string;
    name: string;
    dataConsulta: string;
    horarioConsulta: string;
    sessoesContador: number;
    
}
interface ClientProps {
    clients: AgendaItem[];
}
interface RelatorioResponse {
    faturamentoMensal: number;
    faturamentoAnual: number;
    valoresAtrasados: number;
}
interface AtrasoItem {
    client: {
        id: string;
        name: string;
        situacao: boolean
    };
    valorAberto: number;
}

export default function AgendaList({ clients }: ClientProps) {
    const [clientList, setClientList] = useState(clients || []);
    const [searchTerm, setSearchTerm] = useState('');
    const [relatorioList, setRelatorioList] = useState<RelatorioResponse>();
    const [atrasoList, setAtrasoList] = useState<AtrasoItem[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const apiClient = setupAPIClient();
                const response = await apiClient.get('/caixa/atrasados');
                setAtrasoList(response.data);             
            } catch (error) {
                toast.error('Erro ao carregar Painel');
            }
        };
        fetchData(); 
    }, []);    
    useEffect(() => {
    }, [clientList]);
    useEffect(() => {
        fetchRelatorio(); 
    }, []); 

    const fetchRelatorio = async () => {
        try {
            const apiClient = setupAPIClient(); 
            const response = await apiClient.get<RelatorioResponse>('/caixa/relatorio'); 
            setRelatorioList(response.data);
        } catch (error) {
            toast.error('Erro ao buscar relatorio de caixa')
        }
    };
    const formatDate = (date: string) => {
        try {
            const formattedDate = DateTime.fromFormat(date, "dd/MM/yyyy")
                .setLocale('pt-BR')
                .toFormat("dd 'de' MMMM 'de' yyyy");
            return formattedDate;
        } catch {
            return 'Data inválida';
        }
    };    
    const getMonthName = (month: string) => {
        const months = [
            'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
            'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
        ];
        const monthIndex = parseInt(month, 10) - 1;
        return months[monthIndex];
    };

    function handleOpenCaixa() {
        router.push(`/caixa`);
    }
    
    const handleDelete = async(id: string) => {
        try {
          const apiClient = setupAPIClient(); 
          await apiClient.delete(`/agenda/${id}`);
          toast.success('Agendamento excluido com sucesso!');          
          const updatedClientList = clientList.filter((client) => client.id !== id);
          setClientList(updatedClientList);
        } catch (error) {
          toast.error('Erro ao excluir agendamento!')
        }
      };

      const handleOpenAgenda = async(id: string) => {
        try {
            const apiClient = setupAPIClient(); 
            await apiClient.delete(`/agenda/${id}`);
            toast.success('Agendamento excluido com sucesso!');            
            const updatedClientList = clientList.filter((client) => client.id !== id);
            setClientList(updatedClientList);
          } catch (error) {
            toast.error('Erro ao excluir agendamento!')
          }
        router.push(`/agenda`);
      }      
      const currentDateTime = DateTime.now();
      const formattedCurrentDateTime = currentDateTime.setLocale('pt-BR').toLocaleString(DateTime.DATETIME_MED);

      useEffect(() => {
    }, [formattedCurrentDateTime]);

    return (
        <>
            <Head>
                <title>Próximas sessões - ConsultEasy</title>
            </Head>
            <div>
                <Header />
                <main className={styles.container}>

                    <div className={styles.containerHeader}>
                        <h1><FaList size={25} color="#3FBAC2"/> Próximas consultas</h1>
                        <button>
                            <FiRefreshCcw size={25} color="#3FBAC2" />
                        </button>
                        <p className={styles.dataAtual}>Hoje é dia {formattedCurrentDateTime}</p>
                    </div>

                    <table className={styles.listClients}>
                        <thead>
                            <tr>
                                <th className={styles.tagCell}></th>
                                <th className={styles.tableCell}>Nome</th>
                                <th className={styles.tableCell}>Data consulta</th>
                                <th className={styles.tableCell}>Horário consulta</th>
                                <th className={styles.tableCell}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientList
                                    .map((client, index) => (
                                    <tr key={client.id}  className={styles.orderClient}>
                                        <td className={styles.tagCell}>
                                            <div className={styles.tag} ></div>
                                        </td>
                                        <td className={`${styles.tableCell} ${styles.nameCell}`}>
                                            {client.name.length > 10 ? `${client.name.slice(0, 10)}...` : client.name}
                                        </td>
                                        <td className={styles.tableCell}>
                                            {formatDate(client.dataConsulta)}
                                        </td>
                                        <td className={styles.tableCell}>
                                            {client.horarioConsulta}
                                        </td>
                                        <td className={`${styles.tableCell} ${styles.buttonCell}`}>
                                            <button 
                                                className={styles.buttonDelete} 
                                                onClick={() => handleDelete(client.id)}
                                            >
                                                Excluir
                                                <RiDeleteBin6Line size={17} color="#F13D49" />
                                            </button>
                                            <button 
                                                className={styles.buttonDelete} 
                                                onClick={() => handleOpenAgenda(client.id)}
                                            >
                                                Excluir e remarcar
                                                <RiDeleteBin6Line size={17} color="#F13D49" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>

                    <div className={styles.containerHeader}>
                        <h1><TbBrandCashapp size={28} color="#3FBAC2" />  Relatório financeiro</h1>
                        <button>
                            <FiRefreshCcw size={25} color="#3FBAC2" />
                        </button>
                    </div>

                    <div className={styles.containerCaixa}>
                        <div className={styles.tag2}></div>

                        <div className={styles.container1Relatorio}>
                            <div className={styles.containerFaturamento}>
                                <span><strong>Faturamento Mensal</strong></span>
                                <span><strong>Total: R$ </strong>
                                    <span style={{ color: '#099C3A' }}><strong>{relatorioList?.faturamentoMensal.toFixed(2)}</strong></span>
                                </span>
                            </div>

                            <div className={styles.containerFaturamento}>
                                <span><strong>Faturamento Anual</strong></span>
                                <span><strong>Total: R$ </strong>
                                    <span style={{ color: '#0c8ce9' }}><strong>{relatorioList?.faturamentoAnual.toFixed(2)}</strong></span>
                                </span>
                            </div>

                            <div className={styles.containerFaturamento}>
                                <span><strong>Pagamentos em Atraso</strong></span>
                                <span><strong>Total: R$ </strong>
                                    <span style={{ color: '#FF0A0A' }}><strong>{relatorioList?.valoresAtrasados.toFixed(2)}</strong></span>
                                </span>
                            </div>
                        </div>                        
                    </div>

                    <div className={styles.containerCaixa2}>
                    <div className={styles.tag3}></div>
                        <div>
                            <div className={styles.container2Pendencias}>
                                <h1>Pendências</h1>  
                            </div>

                            <div className={styles.containerSearch}>
                                <input
                                    type="text"
                                    placeholder="Pesquisar cliente cadastrado"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}

                                />
                                    <FiSearch size={30} color="#3FBAC2" />
                                
                            </div>

                            <table className={styles.listClients}>
                            <thead>
                                <tr>
                                <th className={styles.tagCell}></th>
                                <th className={styles.tableCell}>Nome</th>
                                <th className={styles.tableCell}>Valor em aberto</th>
                                <th className={styles.tableCell}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {atrasoList
                                    .filter((index) =>
                                        index.client.name.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                .map((item, index) => (
                                <tr key={index} className={styles.orderClient}>
                                    <td className={styles.tagCell}>
                                    <div className={styles.tag}></div>
                                    </td>
                                    <td className={`${styles.tableCell} ${styles.nameCell}`}>
                                    {item.client.name}
                                    </td>
                                    <td className={styles.tableCell} style={{ color: '#FF0A0A' }}>
                                    {item.valorAberto}
                                    </td>
                                    <td className={`${styles.tableCell} ${styles.buttonCell}`}>
                                            <button
                                                onClick={() => handleOpenCaixa()}
                                                className={styles.buttonEdit}
                                            >
                                                Realizar pagamento
                                                <MdOutlinePayments size={17} color="#099C3A" />
                                            </button>                                           
                                        </td>
                                </tr>
                                ))}
                            </tbody>
                            </table>

                        </div>
                    
                    </div>                    

                </main>
            </div>
        </>
    )
}

export const getServerSideProps = canSSRAuth(async (ctx) => {
    const apiClient = setupAPIClient(ctx);
    const response = await apiClient.get('/agenda/proximas');

    return {
        props: {
            clients: response.data
        }
    };
});
