import React, { useEffect, useState } from "react";
import { Button, FormControl, FormErrorMessage, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text } from "@chakra-ui/react";
import CryptoJS from "crypto-js";
import { toast } from "react-toastify";

interface Props {
    isOpen: boolean;
    onCancel: () => void;
    onConfirm: (key: string) => void;
    items: any[];
}

export const EncryptKeyModal = (props: Props) => {
    const [key, setKey] = useState("");
    const [invalid, setInvalid] = useState(false);

    useEffect(() => {
        setKey("");
    }, [props.isOpen]);

    const onSubmit = () => {
        setInvalid(false);

        let invalid = false;

        try {
            if (props.items.length !== 0) {
                const items = props.items.filter(item => item.encrypted);

                if (items.length !== 0) {
                    const test = items[0];
                    const output = CryptoJS.AES.decrypt(test.text, key).toString(CryptoJS.enc.Utf8);

                    if (output.trim() === "") {
                        invalid = true;
                    }
                }
            }
        } catch (e: any) {
            invalid = true;
        }

        if (invalid) {
            return setInvalid(true);
        }

        sessionStorage.setItem("clip-encryption-key", key);
        props.onConfirm(key);
    }

    return (
        <Modal
            isOpen={props.isOpen}
            onClose={props.onCancel}
            size="md"
        >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Encryption Key</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text marginBottom="2">Please enter your desired encryption key below for this session.</Text>

                    <FormControl isInvalid={invalid}>
                        <Input
                            value={key}
                            onChange={(e) => {
                                setKey(e.target.value);
                                setInvalid(false);
                            }}
                            placeholder="Encryption key..."
                        />
                        <FormErrorMessage>Invalid encryption key</FormErrorMessage>
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button
                        colorScheme="facebook"
                        height="8"
                        onClick={onSubmit}
                    >
                        Submit
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}