import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import React, { useState, useEffect } from 'react';
import appConfig from '../config.json';
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/router';
import { RiDeleteBinLine } from 'react-icons/ri';
import { ButtonSendSticker } from '../src/components/ButtonSendSticker';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzkxMjU4NCwiZXhwIjoxOTU5NDg4NTg0fQ.Z51tYQEnJYE2wJdmpS5ndqye98FP7hOJomDjkxq9NFg';
const SUPABASE_URL = 'https://hhmuxhuklqmwbuugjqzk.supabase.co';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function escutaMensagensEmTempoReal(adicionaMensagem) {
    return supabaseClient
        .from('mensagem')
        .on('INSERT', (respostaLive) => {
            adicionaMensagem(respostaLive.new);
        })
        .subscribe();
}

export default function ChatPage() {

    const roteamento = useRouter();
    const usuarioLogado = roteamento.query.username;
    const [mensagem, setMensagem] = useState('');
    const [listaMensagens, setListaMensagens] = React.useState([]);

    useEffect(async () => {
        supabaseClient
            .from('mensagem')
            .select('*')
            .order('id', { ascending: false })
            .then(({ data }) => {
                setListaMensagens(data);
            });

        escutaMensagensEmTempoReal((novaMensagem) => {
            setListaMensagens((valorAtualDaLista) => {
                return [
                    novaMensagem,
                    ...valorAtualDaLista,
                ]
            });
        })
    }, []);

    function handleNovaMensagem(novaMensagem) {
        const mensagemdefault = {
            // id: listaMensagens.length + 1,
            de: usuarioLogado,
            texto: novaMensagem,
        }

        supabaseClient
            .from('mensagem')
            .insert([
                mensagemdefault
            ])
            .then(({ data }) => {
                console.log('inseriu no banco!')
            })

        setMensagem('');

    }

    return (
        <Box
            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: appConfig.theme.colors.primary[500],
                backgroundImage: `url(https://virtualbackgrounds.site/wp-content/uploads/2020/08/the-matrix-digital-rain.jpg)`,
                backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
            }}
        >
            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    borderRadius: '5px',
                    backgroundColor: appConfig.theme.colors.neutrals[700],
                    height: '100%',
                    maxWidth: '95%',
                    maxHeight: '95vh',
                    padding: '32px',
                }}
            >
                <Header />
                <Box
                    styleSheet={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        height: '80%',
                        backgroundColor: appConfig.theme.colors.neutrals[600],
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',
                    }}
                >

                    <MessageList listaMensagens={listaMensagens} />
                    {/* {listaMensagens.map((mensagemAtual)=>{
                        return(
                            <li key={mensagemAtual.id}>
                                {mensagemAtual.de}: {mensagemAtual.texto}
                            </li>
                        )    
                    })} */}

                    <Box
                        as="form"
                        styleSheet={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <TextField
                            value={mensagem}
                            onChange={(event) => {
                                const valor = event.target.value;
                                setMensagem(valor);
                            }}
                            onKeyPress={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    handleNovaMensagem(mensagem);
                                }
                            }}
                            placeholder="Insira sua mensagem aqui..."
                            type="textarea"
                            styleSheet={{
                                width: '100%',
                                border: '0',
                                resize: 'none',
                                borderRadius: '5px',
                                padding: '6px 8px',
                                backgroundColor: appConfig.theme.colors.neutrals[800],
                                color: appConfig.theme.colors.neutrals[200],
                            }}
                        />
                        <Button
                            onClick={(event) => {
                                event.preventDefault;
                                handleNovaMensagem(mensagem);
                            }}
                            styleSheet={{
                                minWidth: '52px',
                                minHeight: '42px',
                                fontSize: '20px',
                                lineHeight: '0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginLeft: '5px',
                                marginBottom: '7px',
                                border: '1px solid black',
                                backgroundColor: '#29333d',
                                hover: {
                                    backgroundColor: appConfig.theme.colors.neutrals["700"],
                                },
                            }}
                            label="Enter"
                        >Enviar</Button>
                        <ButtonSendSticker
                            onStickerClick={(sticker) => {
                                handleNovaMensagem(`:sticker: ${sticker}`)
                            }}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
    function Header() {
        return (
            <>
                <Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                    <Text variant='heading5'>
                        Chat
                    </Text>
                    <Button
                        variant='tertiary'
                        colorVariant='neutral'
                        label='Logout'
                        href="/"
                    />
                </Box>
            </>
        )
    }

    function MessageList(props) {
        const usuarioLogado = roteamento.query.username;
        return (
            <Box
                tag="ul"
                styleSheet={{
                    overflow: 'scroll',
                    overflowX: 'hidden',
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    flex: 1,
                    color: appConfig.theme.colors.neutrals["000"],
                    marginBottom: '16px',

                }}
            >

                {props.listaMensagens.map((mensagem) => {
                    return (

                        <Text
                            key={mensagem.id}
                            tag="li"
                            styleSheet={{
                                borderRadius: '5px',
                                padding: '6px',
                                marginBottom: '12px',
                                marginRight: '12px',
                                hover: {
                                    backgroundColor: appConfig.theme.colors.neutrals[700],
                                }
                            }}
                        >
                            <Box
                                styleSheet={{
                                    marginBottom: '8px',
                                    display: 'flex',
                                    width: '99%',
                                }}
                            >
                                <Image
                                    styleSheet={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        display: 'inline-block',
                                        marginRight: '8px',
                                    }}
                                    src={`https://github.com/${mensagem.de}.png`}
                                />
                                <Text tag="strong">
                                    {mensagem.de}
                                </Text>
                                <Text
                                    styleSheet={{
                                        fontSize: '10px',
                                        marginLeft: '8px',
                                        marginTop: '5px',
                                        color: appConfig.theme.colors.neutrals[300],
                                    }}
                                    tag="span"
                                >
                                    {(new Date().toLocaleDateString())}
                                </Text>
                                {
                                    usuarioLogado === mensagem.de ?
                                        <Box
                                            title={`Apagar mensagem`}
                                            styleSheet={{
                                                marginLeft: '86.1%',
                                                padding: '2px 15px',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => {
                                                let response = confirm('Deseja apagar a mensagem?');
                                                if (response === true) {
                                                    supabaseClient
                                                        .from('mensagem')
                                                        .delete()
                                                        .match({ id: mensagem.id })
                                                        .then(() => {
                                                            let indice = listaMensagens.indexOf(mensagem);
                                                            listaMensagens.splice(indice, 1)
                                                            setListaMensagens([...listaMensagens])
                                                        })
                                                }
                                            }}
                                        >
                                            {<RiDeleteBinLine />}
                                        </Box>
                                        :
                                        null

                                }
                            </Box>


                            {/* operador ternário, se começacom (':sticker:') faz algo, 
                            se não faz outro algo */}
                            {mensagem.texto.startsWith(':sticker:')
                                ? (
                                    <Image
                                        src={mensagem.texto.replace(':sticker:', '')}
                                        styleSheet={{
                                            maxWidth: '65%',
                                            maxHeight: '65%',
                                        }}
                                    />
                                ) : (
                                    mensagem.texto
                                )
                            }



                        </Text>
                    );
                })}

            </Box>
        )
    }
}
