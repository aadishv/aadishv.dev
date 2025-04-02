import { useEffect, useMemo, useRef, useState } from "react";
import { CharState, type Sentence } from "./Data";
import { useSelector } from "@xstate/store/react";
import { CharacterReview, TrafficLights } from "./characterreview";
import { STORAGE_KEY, store } from "./Store";
import Modal from "react-modal";
import RelativeTime from "@yaireo/relative-time";

function getCharFromState(state: CharState) {
  return state == CharState.green ? "G" : state == CharState.red ? "R" : "Y";
}
/**
 * Simple button component that renders a clickable button with underline decoration
 * @param {string} name - The text to display on the button
 * @param {() => void} onClick - Click handler function
 */
function Button({
  name,
  onClick,
  red = false,
}: {
  name: string;
  onClick: () => void;
  red?: boolean;
}) {
  return (
    <button
      className={`m-0 h-8 justify-center truncate p-0 font-lora underline transition-all duration-300 ease-in-out ${red ? "hover:decoration-red-600" : "hover:decoration-header"} ${red ? "decoration-red-400" : "decoration-header2"}`}
      onClick={onClick}
    >
      {name}
    </button>
  );
}
/**
 * Basic sentence details
 */
function SentenceDetails() {
  const sentence: Sentence = useSelector(
    store,
    (state) => state.context.sentences[0],
  );
  return (
    <div className="bg-stripes-header2 flex w-[50rem] gap-1 rounded-xl border border-header py-3">
      <span className="my-auto w-[20rem] border-r border-r-header px-5 font-lora text-xl">
        <span className="text-transform font-caps font-mono text-sm uppercase text-header">
          lesson
        </span>
        <br />
        {sentence.lesson}
      </span>
      <span className="my-auto w-[30rem] px-5 font-lora text-xl">
        <span className="text-transform font-caps font-mono text-sm uppercase text-header">
          english meaning
        </span>
        <br />
        {sentence.def}
      </span>
      <span className="mt-auto px-3 font-mono text-base text-gray-500">
        {sentence.id}
      </span>
    </div>
  );
}
/**
 * Component that renders a full sentence review interface with multiple characters
 */
function SentenceReview({ done }: { done: () => void }) {
  const id = useRef(
    Math.random().toString(36).substring(2, 10) + Date.now().toString(36),
  ).current;

  const oldState = useMemo(() => {
    return store.getSnapshot().context.history;
  }, []);

  // Move session update to useEffect
  useEffect(() => {
    store.trigger.updateSession({ key: id, date: new Date() });
  }, []);

  const sentences = useSelector(store, (state) => state.context.sentences);
  const [numDone, setNumDone] = useState(0);

  const uniqueWords = useMemo(() => {
    const seen = new Set<string>();
    return sentences[0].words.filter((word) => {
      if (seen.has(word.character)) {
        return false;
      }
      seen.add(word.character);
      return true;
    });
  }, [sentences]);

  // Move event listener to useEffect
  useEffect(() => {
    const handleCompletedCountChanged = (event) => {
      if (event.completedCount !== sentences[0].words.length - numDone) {
        return;
      }
      done();
    };

    store.on("completedCountChanged", handleCompletedCountChanged);
  }, [sentences, numDone, uniqueWords]);
  return (
    <div className="flex flex-wrap">
      {sentences[0].words.map(
        (word: { character: string; pinyin: string }, index: number) => (
          <div key={index}>
            <CharacterReview
              character={word.character}
              pinyin={word.pinyin}
              persistentId={id}
              done={() => setNumDone(numDone + 1)}
            />
          </div>
        ),
      )}
    </div>
  );
}

/**
 * Footer component with the following options: help, skip, show history (-> clear localstorage)
 */
function Footer({
  showModal,
  done,
  progressSentence, // (skips if not done)
}: {
  showModal: () => void;
  done: boolean;
  progressSentence: () => void;
}) {
  return (
    <div className="flex w-full">
      <div className="mb-0 mr-auto flex flex-row gap-5">
        <Button
          name="help"
          onClick={() => {
            window.location.href = "/blog/using-chinese";
          }}
        />
        <Button name="history" onClick={() => showModal()} />
      </div>
      <div className="mb-0 ml-auto flex flex-row gap-5">
        <Button
          name={done ? "continue" : "skip"}
          onClick={() => {
            progressSentence();
          }}
        />
      </div>
    </div>
  );
}
/**
 * Modal component that displays the user's learning history
 * @param {boolean} modalIsOpen - Whether the modal is currently visible
 * @param {() => void} closeModal - Function to close the modal
 * @param {Record<string, string>} relativeTimes - Object mapping characters to relative time strings
 * @param {Object} history - User's learning history data from the store
 */
function MyModal({ modalIsOpen, closeModal, relativeTimes, history }) {
  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      contentLabel="History Modal"
      className="m-auto w-3/4 max-w-lg bg-white font-lora"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      ariaHideApp={false}
    >
      <div className="bg-stripes-header2 h-full w-full p-6">
        <h2 className="mb-4 text-xl font-bold">Learning history</h2>
        <div className="mb-4">
          {!Object.keys(history).length && (
            <p>
              Your learning history will appear here. It is currently empty.
            </p>
          )}
          {Object.keys(history).length > 0 && (
            <div className="list-disc">
              {Object.entries(history).map(([key, value]) => (
                <div key={key} className="flex">
                  <span className="w-20 font-lora text-xl font-bold">
                    {key}
                  </span>
                  <span className="my-auto px-4">
                    <TrafficLights state={value[0]} checkMark={false} />
                  </span>
                  <span className="my-auto px-4 font-mono text-gray-500">
                    {relativeTimes[key]} ({value[1].slice(0, 7)})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-between">
          <div className="px-4 py-2">
            <Button
              name="Clear Data"
              red
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to delete all data from past practice sessions?",
                  )
                ) {
                  localStorage.removeItem(STORAGE_KEY);
                  window.location.reload();
                }
              }}
            />
          </div>
          <div className="px-4 py-2">
            <Button name="Close" onClick={closeModal} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
/**
 * Main application component that manages app state and renders appropriate view
 */
export default function ChineseApp() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [done, setDone] = useState(false);

  // Function to show modal
  const showModal = () => {
    setModalIsOpen(true);
  };
  // Function to close modal
  const closeModal = () => {
    setModalIsOpen(false);
  };

  const history = useSelector(store, (state) => state.context.history);

  const relativeTimes = useMemo(() => {
    // Only calculate relative times when modal is open
    if (!modalIsOpen) return {};

    const rtf = new RelativeTime();
    let times = {} as Record<string, string>;

    Object.entries(history).forEach(([char, [_, sessionId]]) => {
      if (store.getSnapshot().context.sessions[sessionId]) {
        const time = new Date(store.getSnapshot().context.sessions[sessionId]);
        times[char] = rtf.from(time);
      }
    });

    return times;
  }, [modalIsOpen, history]);

  const currentId = useSelector(
    store,
    (state) => state.context.sentences[0].id,
  );
  return (
    <div className="flex h-full w-full flex-col items-center justify-center text-2xl">
      <div className="p-20 pt-20">
        <SentenceDetails />
        <SentenceReview key={currentId} done={() => setDone(true)} />
      </div>
      <MyModal
        modalIsOpen={modalIsOpen}
        closeModal={closeModal}
        relativeTimes={relativeTimes}
        history={history}
      />
      <div className="mt-auto w-full p-5 px-20">
        <Footer
          showModal={showModal}
          done={done}
          progressSentence={() => {
            setDone(false);
            store.trigger.progressSentence();
          }}
        />
      </div>
    </div>
  );
}
