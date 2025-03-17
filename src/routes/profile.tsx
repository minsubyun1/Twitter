import { auth, db, storage } from "../firebase"
import styled from "styled-components";
import React, { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweet";

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 20px;
`;

const AvatarUpload = styled.label`
    width: 80px;
    overflow: hidden;
    height: 80px;
    border-radius: 50%;
    background-color: #1d9bf0;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    svg{
        width:50px;
    }
`;
const AvatarImg = styled.img`
    width: 100%;

`;
const AvatarInput = styled.input`
    display: none;
`
const NameWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;

const NameInput = styled.input`
    font-size: 22px;
    border: 1px solid #ccc;
    padding: 5px;
    border-radius: 5px;
`;

const Name = styled.span`
    font-size: 22px;
`;

const EditButton = styled.button`
    background-color: #1d9bf0;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
`;

const Tweets = styled.div`
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 10px;
`

export default function Profile(){
    const user = auth.currentUser;
    const [avatar, setAvatar] = useState(user?.photoURL);
    const [tweets, setTweets] = useState<ITweet[]>([]);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newDisplayName, setNewDisplayName] = useState(user?.displayName || "Anonymous");
    const onAvatarChange = async (e:React.ChangeEvent<HTMLInputElement>) => {
        const {files} = e.target;
        if(!user) return;
        if (files && files.length === 1){
            const file = files[0];
            const locationRef = ref(storage, `avatars/${user?.uid}`);
            const result = await uploadBytes(locationRef, file);
            const avatarUrl = await getDownloadURL(result.ref);
            setAvatar(avatarUrl);
            await updateProfile(user, {
                photoURL: avatarUrl,
            });
        }   
    };

    const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewDisplayName(e.target.value);
    };

    const onSaveName = async () => {
        if(!user || newDisplayName.trim() === "") return;
        await updateProfile(user, {displayName: newDisplayName});
        setIsEditingName(false);
    }

    const fetchTweets = async()=> {
        const tweetQuery = query(
            collection(db, "tweets"),
            where("userId", "==", user?.uid),
            orderBy("createdAt", "desc"),
            limit(25)
        );
        const snapshot = await getDocs(tweetQuery);
        const tweets = snapshot.docs.map(doc => {
            const {tweet, createdAt, userId, username, photo} = doc.data();
            return {
            tweet, 
            createdAt, 
            userId, 
            username, 
            photo,
            id: doc.id,
            };
        
        })
        setTweets(tweets);
    };

    useEffect(() => {
        fetchTweets();
    }, []);

    return <Wrapper>
        <AvatarUpload htmlFor="avatar">
            {avatar ? (<AvatarImg src={avatar} />) : <svg fill="currentColor" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"></path>
</svg>}
        </AvatarUpload>
        <AvatarInput onChange={onAvatarChange} id="avatar" type="file" accept ="image/*" />
        <NameWrapper>
            {isEditingName ? (
                <>
                    <NameInput value={newDisplayName} onChange={onNameChange} />
                    <EditButton onClick={onSaveName}>Save</EditButton>
                    <EditButton onClick={() => setIsEditingName(false)}>Cancel</EditButton>
                </>
            ) : (
                <>
                    <Name>{user?.displayName ?? "Anonymous"}</Name>
                    <EditButton onClick={() => setIsEditingName(true)}>Edit</EditButton>
                </>
            )}
        </NameWrapper>
        <Tweets>
            {tweets.map(tweet => <Tweet key={tweet.id} {...tweet}/>)}
        </Tweets>
    </Wrapper>
}