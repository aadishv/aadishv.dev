import React, { useRef } from "react";

interface SearchBarProps {
  inputRef: React.RefObject<HTMLInputElement>;
  onSearch: (e: React.FormEvent) => void;
}

export const SearchBar = ({ inputRef, onSearch }: SearchBarProps) => {
  return (
    <form onSubmit={onSearch} className="flex">
      <input
        ref={inputRef}
        type="text"
        placeholder="Search... (Cmd+F)"
        className="border-b-2 border-header2 font-mono text-xl focus:border-header focus:outline-none"
        style={{ width: "56vw", marginRight: "2vw" }}
      />
      <button type="submit" className="sr-only">
        Submit
      </button>
    </form>
  );
};

interface RandomButtonProps {
  onClickRandom: () => void;
}

export const RandomButton = ({ onClickRandom }: RandomButtonProps) => {
  return (
    <div className="mr-4 flex items-end">
      <button
        className="m-0 h-8 justify-center truncate border-b-2 border-header2 p-0 font-lora text-xl hover:border-header"
        onClick={onClickRandom}
      >
        Random
      </button>
    </div>
  );
};

interface ReferenceButtonProps {
  onClickReference: () => void;
}

export const ReferenceButton = ({ onClickReference }: ReferenceButtonProps) => {
  return (
    <div className="mr-4 flex items-end">
      <button
        className="m-0 h-8 justify-center truncate border-b-2 border-header2 p-0 font-lora text-xl hover:border-header"
        onClick={onClickReference}
      >
        References
      </button>
    </div>
  );
};

interface ModalButtonProps {
  onClickModal: () => void;
}

export const ModalButton = ({ onClickModal }: ModalButtonProps) => {
  return (
    <div className="flex items-end">
      <button
        className="m-0 h-8 justify-center truncate border-b-2 border-header2 p-0 font-lora text-xl hover:border-header"
        onClick={onClickModal}
      >
        Formula mass calculator
      </button>
    </div>
  );
};

export const Controls = ({
  searchInputRef,
  handleSearch,
  handleRandomClick,
  handleReferenceModalOpen,
  handleMassModalToggle
}) => {
  return (
    <div className="flex" style={{ margin: "2vw" }}>
      <SearchBar inputRef={searchInputRef} onSearch={handleSearch} />
      <div className="flex-grow" />
      <RandomButton onClickRandom={handleRandomClick} />
      <ReferenceButton onClickReference={handleReferenceModalOpen} />
      <ModalButton onClickModal={handleMassModalToggle} />
    </div>
  );
};