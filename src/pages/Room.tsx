import { FormEvent, useState } from 'react';
import { useParams } from 'react-router-dom';

import logoImg from '../assets/images/logo.svg';
import { Button } from '../components/Button';
import { Question } from '../components/Question';
import { RoomCode } from '../components/RoomCode';
import { useAuth } from '../hooks/useAuth';
import { useRoom } from '../hooks/useRoom';
import { database } from '../services/firebase';

import '../styles/room.scss';

type RoomParams = {
    id: string;
}
export function Room(){

    const { user } = useAuth();
    const params = useParams<RoomParams>(); 
    const [newQuestion, setNewQuestion] = useState(''); 
    const roomId = params.id;
    const { title, questions } = useRoom(roomId)
    
    async function handleSendQuestion(event: FormEvent){
        event.preventDefault();
        if(newQuestion.trim() == ''){
            return;
        }
        
        if (!user){
            throw new Error('You  must be logged in');

        }
        const question = {
            content: newQuestion,
            author: {
                name: user?.name,
                avatar: user.avatar,
               
            },
            isHighligted: false, 
            inAnwsered: false
        };

        await database.ref(`rooms/${roomId}/questions`).push(question); 

        setNewQuestion(''); 
    }

    async function handleLikeQuestion(questionId: string, likeId: string | undefined){
       if (likeId){
        await database.ref(`rooms/${roomId}/questions/${questionId}/likes/${likeId}`).remove()
       }else {
         await database.ref(`rooms/${roomId}/questions/${questionId}/likes/`).push({
         authorId: user?.id,
        })
       }
    }
    return ( 
        <div id="page-room">
            <header>
                <div className="content">
                    <img src={logoImg} alt="Letmeask" />   
                    <RoomCode code={params.id} />              
                </div>
            </header>

            <main>
                <div className="room-title">
                    <h1>Sala {title}</h1>
                   { questions.length > 0 && <span>{questions.length} pergunta(s)</span>}
                </div>

                <form onSubmit={handleSendQuestion}>
                    <textarea 
                         placeholder="O que você quer perguntar?"
                         onChange={event => setNewQuestion(event.target.value)} 
                         value={newQuestion} 
                    />
                    <div className="form-footer">
                       { user ? (
                           <div className="user-info"> 
                               <img src={user.avatar} alt={user.name}/>
                               <span>{user.name}</span>
                            </div>
                        ) : (
                        <span>Para enviar uma pergunta, <button>faça seu login</button>.</span>
                       ) }
                        <Button type="submit" disabled={!user}>Enviar pergunta</Button>
                    </div>
                </form>
                <div className="question-list"> 
                    {questions.map(question => {
                        return (
                            <Question 
                                key={question.id}
                                content={question.content}
                                author={question.author}
                                isAnswered={question.isAnswered}
                                isHighlighted={question.isHiglighted}
                            >
                               { !question.isAnswered && (
                                    <button
                                        className={`like-button ${question.likeId ? 'liked' : ''}`}
                                        type="button"
                                        aria-label="Marcar como gostei"
                                        onClick={() => handleLikeQuestion(question.id, question.likeId)}
                                        >
                                        { question.likeCount > 0  && <span>{question.likeCount}</span> }
                                        <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                                            width="24" height="23" viewBox="0 0 24 24"
                                            preserveAspectRatio="xMidYMid meet">
                                            <g transform="translate(0.000000,24.000000) scale(0.100000,-0.100000)"
                                                fill="#000000" strokeWidth="1.5">
                                                <path d="M110 215 c0 -8 -11 -25 -26 -38 -22 -21 -25 -30 -22 -83 l3 -59 57
                                                -3 57 -3 21 41 c28 54 24 84 -12 88 -21 3 -28 9 -28 26 0 25 -17 46 -37 46 -7
                                                0 -13 -7 -13 -15z m25 -45 c-6 -29 -5 -30 29 -30 41 0 43 -5 19 -55 -15 -32
                                                -20 -35 -60 -35 l-43 0 0 46 c0 32 7 54 23 74 29 37 40 37 32 0z"/>
                                                <path d="M20 95 c0 -37 4 -65 10 -65 6 0 10 28 10 65 0 37 -4 65 -10 65 -6 0
                                                -10 -28 -10 -65z"/>
                                            </g>
                                        </svg>
                                    </button>
                                )}
                            </Question>
                        );      
                    })} 
                </div>
            </main>
        </div>
    );
}