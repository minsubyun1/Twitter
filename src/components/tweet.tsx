import styled from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { deleteObject, ref, getDownloadURL, uploadBytes} from "firebase/storage";
import { useState } from "react";

const Wrapper = styled.div`
    display: grid;
    grid-template-columns: 3fr 1fr;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 15px;
`;

const Column = styled.div``;

const Photo = styled.img`
    width: 100px;
    height: 100px;
    border-radius: 15px;
`;

const Username = styled.span`
    font-weight: 600;
    font-size: 15px;
`;

const Payload = styled.p`
    margin: 10px 0px;
    font-size: 18px;
`;

const Button = styled.button`
    background-color: tomato;
    color: white;
    font-weight: 600;
    border: 0;
    font-size: 12px;
    padding: 5px 10px;
    text-transform: uppercase;
    border-radius: 5px;
    cursor: pointer;
    margin-right: 5px;
`;

const DeleteButton = styled.button`
    background-color:tomato;
    color:white;
    font-weight: 600;
    border: 0;
    font-size: 12px;
    padding: 5px 10px;
    text-transform: uppercase;
    border-radius: 5px;
    cursor: pointer;
`;

const TextArea = styled.textarea`
    width: 100%;
    height: 60px;
    font-size: 16px;
    padding: 5px;
    border-radius: 10px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    font-size: 16px;
`;

const FileInput = styled.input`
    display: none;
`;
const FileLabel = styled.label`
    background-color: #1d9bf0;
    color: white;
    padding: 5px 10px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 5px;
    cursor: pointer;
    display: inline-block;
`;

export default function Tweet({ username, photo, tweet, userId, id }:ITweet){
    const user = auth.currentUser;
    const [isEditing, setIsEditing] = useState(false);
    const [newTweet, setNewTweet] = useState(tweet);
    const [newPhoto, setNewPhoto] = useState<File | null>(null);

    const onDelete = async () => {
        const ok = confirm("Are you sure you want to delete this tweet?");

        if (!ok || user?.uid !== userId) return;
        try {
            await deleteDoc(doc(db, "tweets", id));
            if(photo){
                const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
                await deleteObject(photoRef);
            }
        } catch (e) {
            console.log(e);
        } finally {

        }
    }

    const onEdit = async () => {
        if(newTweet === "" || newTweet.length > 180) return;
        try {
            const tweetRef = doc(db, "tweets", id);
            if(newPhoto){
                const photoRef = ref(storage, `tweets/${user?.uid}/${id}}`);
                await uploadBytes(photoRef, newPhoto);
                const photoURL = await getDownloadURL(photoRef);
                await updateDoc(tweetRef, {tweet : newTweet, photo: photoURL});
            } else {
                await updateDoc(tweetRef, {tweet : newTweet});
            }
            
            setIsEditing(false);
        } catch (e) {
            console.log(e);
        }
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setNewPhoto(e.target.files[0]);
        }
    };

    return (
    <Wrapper>
        <Column>
            <Username>{username}</Username>
            {isEditing ? (
                    <>
                        <TextArea
                            value={newTweet}
                            onChange={(e) => setNewTweet(e.target.value)}
                        />
                        <FileLabel htmlFor={`file-${id}`}>Change Photo</FileLabel>
                        <FileInput id={`file-${id}`} type="file" accept="image/*" onChange={onFileChange} />
                        <Button onClick={onEdit}>Save</Button>
                        <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                    </>
                ) : (
                    <>
                        <Payload>{tweet}</Payload>
                        {user?.uid === userId && (
                            <>
                                <Button onClick={() => setIsEditing(true)}>Edit</Button>
                                <DeleteButton onClick={onDelete}>Delete</DeleteButton>
                            </>
                        )}
                    </>
                )}
        </Column>
        <Column>
         {photo && <Photo src={photo} />}
        </Column>
    </Wrapper>
    )
}

// <DeleteButton onClick={onDelete}>delete</DeleteButton> : null