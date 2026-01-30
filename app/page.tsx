import { CreateRoomButton } from '@/components/CreateRoomButton';
import { JoinRoomForm } from '@/components/JoinRoomForm';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Planning Poker</h1>
          <p className="text-gray-600">Estimate together, remotely</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Start a new game</h2>
            <CreateRoomButton />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">or</span>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Join existing room</h2>
            <JoinRoomForm />
          </div>
        </div>
      </div>
    </main>
  );
}
