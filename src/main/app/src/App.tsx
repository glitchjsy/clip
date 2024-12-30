import { Box, Button, ChakraProvider, CloseButton, Container, Flex, Heading, Input, Modal, Switch, Text, Textarea, useDisclosure } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import CryptoJS from "crypto-js";
import theme from "./theme";
import { EncryptKeyModal } from "./components/EncryptKeyModal";

const API_URL = "/api";
const SESSION_ID_LENGTH = 6;

export const App = () => {
    const [code, setCode] = useState("");
    const [encrypted, setEncrypted] = useState(false);
    const [encryptionKey, setEncryptionKey] = useState("");
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        const savedCode = sessionStorage.getItem("clip-session-id");

        if (savedCode !== null && savedCode !== undefined) {
            setCode(savedCode);
            fetchSession(savedCode);
        }
    }, []);

    useEffect(() => {
        if (code) {
            const id = setInterval(() => fetchSession(code, false), 1000);
            return () => clearInterval(id);
        }
    }, [code]);

    useEffect(() => {
        const key = sessionStorage.getItem("clip-encryption-key");

        if (key !== undefined && key !== null) {
            onEncrypt(key);
        }
    }, []);

    const fetchSession = async (code: string, shouldAlert: boolean = true) => {
        try {
            const response = await fetch(`${API_URL}/session/${code}`);

            if (response.ok) {
                const data = await response.json();

                sessionStorage.setItem("clip-session-id", code);
                sessionStorage.setItem("clip-items", JSON.stringify(data));

                setItems(data);
            } else {
                if (response.status === 404) {
                    onChange();
                    return toast("The session has been deleted", { type: "error" });
                }
            }
        } catch (e: any) {
            if (shouldAlert) {
                toast("Failed to fetch items", { type: "error" });
            }
        }
    }

    const onJoin = (code: string) => {
        setCode(code);
        fetchSession(code);
    }

    const onDelete = async () => {
        try {
            const response = await fetch(`${API_URL}/session/${code}`, { method: "DELETE" });

            if (response.ok) {
                sessionStorage.clear();
                setCode("");
                setItems([]);
            }
        } catch (e: any) {
            toast("Failed to delete session", { type: "error" });
        }
    }

    const onChange = () => {
        setCode("");
        sessionStorage.clear();
    }

    const onAddItem = (item: any) => {
        setItems([item, ...items]);
        sessionStorage.setItem("clip-items", JSON.stringify([item, ...items]));
    }

    const onDeleteItem = (itemId: string) => {
        const newItems = items.filter(item => {
            if (item.id !== itemId) {
                return true;
            }
            return false;
        });
        setItems(newItems);
        sessionStorage.setItem("clip-items", JSON.stringify(newItems));
    }

    const clearEncryption = () => {
        setEncrypted(false);
        setEncryptionKey("");
        sessionStorage.removeItem("clip-encryption-key");
    }

    const onEncrypt = (key: string) => {
        setEncrypted(true);
        setEncryptionKey(key);
    }

    return (
        <ChakraProvider theme={theme}>
            <Box paddingX="2">
                <Flex
                    height="250px"
                    flexDirection="column"
                    alignItems="center"
                    textAlign="center"
                    paddingTop="100px"
                >
                    <Heading
                        fontSize="60px"
                        fontWeight="800"
                        marginBottom="10px"
                    >
                        Clip
                    </Heading>

                    <Text
                        color="rgb(107,114,128)"
                        fontSize="20px"
                    >
                        Effortlessly copy & paste between devices
                    </Text>
                </Flex>

                <Flex
                    marginBottom="8"
                    justifyContent="center"
                >
                    {!code ? <CreateSection onJoin={onJoin} /> : <InfoSection code={code} onChange={onChange} onDelete={onDelete} />}
                </Flex>

                <Container maxWidth={{ base: "100%", md: "50%" }}>
                    {code && (
                        <MainSection
                            code={code}
                            items={items}
                            encrypted={encrypted}
                            encryptionKey={encryptionKey}
                            onEncrypt={onEncrypt}
                            onAddItem={onAddItem}
                            onDeleteItem={onDeleteItem}
                        />
                    )}
                </Container>
                <Container maxWidth={{ base: "100%", md: "70%" }}>
                    {!code && <HowItWorks />}
                </Container>
            </Box>

            <ToastContainer />
        </ChakraProvider>
    )
}

const HowItWorks = () => {
    return (
        <Box textAlign="center">
            <Text fontSize="18" fontWeight="bold">How It Works</Text>
            <Text color="rgb(107,114,128)" marginBottom="4">
                Open up this page on two devices (or two tabs if you"re testing!). On one page, click <strong>Create Session</strong>. On another page, enter
                the <strong>Session ID</strong> and click <strong>Join</strong>. Type in the box, hit enter, and watch it appear on the other page!
            </Text>
            <Text color="rgb(107,114,128)" marginBottom="4">
                You can delete invidual items or delete the entire session itself. Please note that clicking <strong>Change session</strong> will not delete the session,
                it will remove you from it.
            </Text>
            <Text color="rgb(107,114,128)" fontWeight="bold">
                NOTE: Sessions expire automatically after 10 minutes of inactivity
            </Text>
        </Box>
    )
}

const MainSection = ({ code, items, encrypted, encryptionKey, clearEncryption, onEncrypt, onAddItem, onDeleteItem }: any) => {
    const [text, setText] = useState("");

    const { isOpen: isEncryptKeyModalOpen, onClose: onEncryptKeyModalClose, onOpen: onEncryptKeyModalOpen } = useDisclosure();

    const addText = async () => {
        try {
            const finalText = encrypted ? CryptoJS.AES.encrypt(text, encryptionKey).toString() : text;
            const response = await fetch(`${API_URL}/session/${code}/items`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: finalText, encrypted })
            });

            if (response.ok) {
                const data = await response.json();
                onAddItem(data);
            }
        } catch (e: any) {
            console.error(e);
            toast("Failed to add item", { type: "error" });
        }
    }

    const deleteItem = async (itemId: string) => {
        try {
            const response = await fetch(`${API_URL}/session/${code}/items/${itemId}`, { method: "DELETE" });

            if (response.ok) {
                onDeleteItem(itemId);
            }
        } catch (e: any) {
            console.error(e);
            toast("Failed to delete item", { type: "error" });
        }
    }

    const onEncryptToggle = (e: any) => {
        if (encrypted && items.length !== 0) {
            return toast("You can't change encryption key for this session unless all items are deleted", { type: "error" });
        }
        if (e.target.checked) {
            onEncryptKeyModalOpen();
        } else {
            clearEncryption();
        }
    }

    return (
        <Box>
            <Textarea
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                marginBottom="2"
                placeholder="Enter text here..."
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        addText();
                    }
                }}
            />
            <Flex alignItems="center">
                <Button
                    colorScheme="facebook"
                    height="8"
                    isDisabled={text.length === 0}
                    onClick={addText}
                >
                    Add Text
                </Button>

                <Switch
                    colorScheme="facebook"
                    isChecked={encrypted}
                    onChange={onEncryptToggle}
                    marginLeft="4"
                >
                    Encrypted
                </Switch>
            </Flex>

            <Flex
                flexDirection="column"
                gap="4"
                marginTop="5"
                marginBottom="20"
            >
                {items
                    .sort((a: any, b: any) => b.creationDate - a.creationDate)
                    .map((item: any) => {
                        let finalText = item.text;
                        let textColor = "black";

                        try {
                            if (item.encrypted) {
                                if (!encryptionKey) {
                                    finalText = "This item is encrypted. Please tick encryption above and enter the key view.";
                                    textColor = "red";
                                } else {
                                    finalText = CryptoJS.AES.decrypt(item.text, encryptionKey).toString(CryptoJS.enc.Utf8);

                                    if (finalText.trim() === "") {
                                        finalText = "The encryption key used for this item is different, this shouldn't usually happen. Please remove all items and set a new encryption key.";
                                        textColor = "#c47206";
                                    }
                                }
                            }
                        } catch (e: any) {
                            finalText = item.text;
                        }

                        const creationDate = new Date(item.creationDate).toLocaleString("en-GB", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true,
                        });

                        return (
                            <Flex
                                key={item.id}
                                bgColor="white"
                                paddingX="4"
                                paddingY="2"
                                justifyContent="space-between"
                            >
                                <Box>
                                    <Text color={textColor} fontSize="14">{finalText}</Text>
                                    <Flex>
                                        <Text color="muted" fontSize="14">{creationDate}</Text>
                                        {item.encrypted && <Text color="green" fontSize="14" marginLeft="4">Encrypted</Text>}
                                    </Flex>
                                </Box>
                                <CloseButton onClick={() => deleteItem(item.id)} />
                            </Flex >
                        )
                    })}
            </Flex >

            <EncryptKeyModal
                isOpen={isEncryptKeyModalOpen}
                onCancel={onEncryptKeyModalClose}
                items={items}
                onConfirm={(key: string) => {
                    onEncryptKeyModalClose();

                    if (key === null || key === undefined) {
                        clearEncryption();
                    } else {
                        onEncrypt(key);
                    }
                }}
            />
        </Box >
    )
}

const CreateSection = ({ onJoin }: any) => {
    const [code, setCode] = useState("");

    const createSession = async () => {
        try {
            const response = await fetch(`${API_URL}/session/new`, { method: "POST" });

            if (response.ok) {
                const data = await response.json();

                if (!data?.code) {
                    return toast("Received invalid response while creating session", { type: "error" });
                }

                sessionStorage.setItem("clip-session-id", data.code.toUpperCase());
                sessionStorage.setItem("clip-items", "[]");

                onJoin(data.code.toUpperCase());
            }
        } catch (e: any) {
            toast("Failed to create session", { type: "error" });
        }
    }

    const joinSession = async () => {
        try {
            if (code.length !== SESSION_ID_LENGTH) {
                return toast("Invalid Session ID", { type: "error" });
            }
            const response = await fetch(`${API_URL}/session/${code}`);

            if (response.ok) {
                const data = await response.json();

                sessionStorage.setItem("clip-session-id", code);
                sessionStorage.setItem("clip-items", JSON.stringify(data));

                onJoin(code);
            } else {
                if (response.status === 404) {
                    return toast("Session not found", { type: "error" });
                }
            }
        } catch (e: any) {
            toast("Failed to join session", { type: "error" });
        }
    }

    return (
        <Flex
            bgColor="rgb(31 41 55)"
            justifyContent="space-between"
            color="white"
            height="fit-content"
            gap="20px"
            boxShadow="0 0 #0000, 0 0 #0000, 0 10px 15px -3px rgba(0, 0, 0, .1), 0 4px 6px -4px rgba(0, 0, 0, .1)"
            borderRadius="10px"
            padding="30px"
            width={{ base: "100%", md: "60%" }}
        >
            <Flex
                width="100%"
                justifyContent="space-evenly"
                flexDirection={{ base: "column", md: "row" }}
                textAlign="center"
            >
                <Box
                    width="100%"
                    borderRight={{ base: "none", md: "1px solid #e3e3e3" }}
                    borderBottom={{ base: "1px solid #e3e3e3", md: "none" }}
                    paddingBottom={{ base: 6, md: "0" }}
                >
                    <Heading size="xs">New Session</Heading>
                    <Button
                        bgColor="white"
                        color="black"
                        height="8"
                        marginTop="4"
                        onClick={createSession}
                    >
                        Create
                    </Button>
                </Box>

                <Box width="100%" paddingTop={{ base: 6, md: "0" }}>
                    <Heading size="xs">Join Session</Heading>

                    <Flex
                        marginTop="4"
                        gap="2"
                        justifyContent="center"
                    >
                        <Input
                            height="8"
                            color="black"
                            maxLength={6}
                            maxWidth="60%"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    joinSession();
                                }
                            }}
                        />
                        <Button
                            bgColor="white"
                            color="black"
                            height="8"
                            isDisabled={code.length < SESSION_ID_LENGTH}
                            onClick={joinSession}
                        >
                            Join
                        </Button>
                    </Flex>
                </Box>
            </Flex>
        </Flex>
    )
}

const InfoSection = ({ code, onChange, onDelete }: any) => {
    return (
        <Flex
            bgColor="rgb(31 41 55)"
            justifyContent="space-between"
            color="white"
            height="fit-content"
            gap="20px"
            boxShadow="0 0 #0000, 0 0 #0000, 0 10px 15px -3px rgba(0, 0, 0, .1), 0 4px 6px -4px rgba(0, 0, 0, .1)"
            borderRadius="10px"
            padding="30px"
            width={{ base: "100%", md: "60%" }}
        >
            <Flex
                width="100%"
                justifyContent="space-evenly"
                textAlign="center"
                flexDirection={{ base: "column", md: "row" }}
            >
                <Box
                    width="100%"
                    paddingBottom={{ base: 2, md: "0" }}
                >
                    <Heading size="xs">Session ID</Heading>
                    <Text fontSize="26">{code}</Text>
                </Box>

                <Box width="100%" paddingTop={{ base: 2, md: "0" }}>
                    <Flex
                        marginTop="4"
                        gap="2"
                        justifyContent="center"
                    >
                        <Button
                            bgColor="white"
                            color="black"
                            height="8"
                            onClick={onChange}
                        >
                            Change session
                        </Button>

                        <Button
                            bgColor="white"
                            color="black"
                            height="8"
                            onClick={onDelete}
                        >
                            Delete session
                        </Button>
                    </Flex>
                </Box>
            </Flex>
        </Flex>
    )
}