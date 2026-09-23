import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, Trophy, Sparkles, CheckCircle, Loader2, Ticket as TicketIcon } from 'lucide-react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import AuthGate from '../components/events/AuthGate';

const EventCard = ({ event, onBuyTicket, hasTicket, isBuying, currentUser }) => {
  const isFree = event.price === 0;
  const totalPrice = event.price + (event.service_fee || 0);
  const isSoldOut = event.capacity && event.tickets_sold >= event.capacity;

  return (
  <motion.div
    whileHover={{ y: -5 }}
    className="h-full"
  >
    <Card className="ledger-card h-full group overflow-hidden">
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className={`${
            event.event_type === 'drop' ? 'bg-purple-500' :
            event.event_type === 'community' ? 'bg-blue-500' :
            event.event_type === 'exclusive' ? 'bg-yellow-500 text-black' :
            'bg-green-500'
          } border-none font-semibold`}>
            {event.event_type.toUpperCase()}
          </Badge>
          {event.is_exclusive && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-none">
              <Trophy className="w-3 h-3 mr-1" />
              VIP
            </Badge>
          )}
          {isSoldOut && (
            <Badge className="bg-red-500 text-white border-none">
              SOLD OUT
            </Badge>
          )}
        </div>
      </div>
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="ledger-text-primary group-hover:ledger-accent transition-colors">
              {event.title}
            </CardTitle>
            <p className="ledger-text-secondary text-sm mt-1">{event.subtitle}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold ledger-accent">{format(new Date(event.date), 'MMM d')}</div>
            <div className="text-xs ledger-text-muted">{format(new Date(event.date), 'yyyy')}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="ledger-text-secondary text-sm line-clamp-2">{event.description}</p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 ledger-text-muted">
            <Clock className="w-4 h-4" />
            {event.time}
          </div>
          <div className="flex items-center gap-2 ledger-text-muted">
            <MapPin className="w-4 h-4" />
            {event.location}
          </div>
          <div className="flex items-center gap-2 ledger-text-muted">
            <Users className="w-4 h-4" />
            {event.tickets_sold || 0} {event.capacity ? `/ ${event.capacity}` : ''} attending
          </div>
          {!isFree && (
            <div className="flex items-center gap-2 ledger-accent font-bold">
              <TicketIcon className="w-4 h-4" />
              ${totalPrice.toFixed(2)}
              {event.service_fee > 0 && (
                <span className="text-xs ledger-text-muted">(+${event.service_fee} fee)</span>
              )}
            </div>
          )}
        </div>

        <div className="pt-4 border-t ledger-border">
          {hasTicket ? (
            <div className="flex items-center justify-center gap-2 py-2 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">You have a ticket!</span>
            </div>
          ) : isSoldOut ? (
            <Button disabled className="w-full" variant="outline">
              Sold Out
            </Button>
          ) : (
            <Button 
              onClick={() => onBuyTicket(event)}
              disabled={isBuying}
              className="w-full ledger-btn-primary"
            >
              {isBuying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <TicketIcon className="w-4 h-4 mr-2" />
                  {isFree ? 'RSVP Free' : `Buy Ticket - $${totalPrice.toFixed(2)}`}
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  </motion.div>
  );
};

export default function Events() {
  const [filter, setFilter] = useState('all');
  const [isBuying, setIsBuying] = useState(null);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [myTickets, setMyTickets] = useState(new Set());

  // Load current user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (error) {
        setCurrentUser(null);
      }
    };
    loadUser();
  }, []);

  // Fetch events from database
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const allEvents = await base44.entities.Event.list('-date', 50);
      return allEvents.filter(e => e.status === 'upcoming');
    },
  });

  // Fetch user's tickets
  const { data: userTickets = [] } = useQuery({
    queryKey: ['user-tickets', currentUser?.email],
    queryFn: async () => {
      if (!currentUser) return [];
      return await base44.entities.Ticket.filter({ 
        user_email: currentUser.email, 
        status: 'valid' 
      });
    },
    enabled: !!currentUser,
  });

  // Update my tickets set
  useEffect(() => {
    const ticketEventIds = new Set(userTickets.map(t => t.event_id));
    setMyTickets(ticketEventIds);
  }, [userTickets]);

  const handleBuyTicket = async (event) => {
    // Auth gate
    if (!currentUser) {
      setShowAuthGate(true);
      return;
    }

    // Check if running in iframe (preview mode)
    if (window.self !== window.top) {
      alert('Checkout is only available in the published app. Please visit your live site to purchase tickets.');
      return;
    }

    setIsBuying(event.id);
    
    try {
      const { data } = await base44.functions.invoke('createEventCheckout', {
        event_id: event.id,
        success_url: `${window.location.origin}/events?success=true&event_id=${event.id}`,
        cancel_url: `${window.location.origin}/events?cancelled=true`,
      });

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Failed to create checkout. Please try again.');
    } finally {
      setIsBuying(null);
    }
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.event_type === filter;
  });

  const myEventsList = events.filter(event => myTickets.has(event.id));

  return (
    <div className="min-h-screen ledger-theme">
      <div className="container py-12">
        <header className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-block p-4 bg-white/5 rounded-full mb-6">
              <Calendar className="w-8 h-8 ledger-accent" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black ledger-text-primary mb-4">
              Events & Drops
            </h1>
            <p className="text-lg ledger-text-secondary max-w-3xl mx-auto">
              Join exclusive events, early access drops, and community gatherings. RSVP to mint your soulbound event passes.
            </p>
          </motion.div>
        </header>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-ledger-surface p-1 rounded-lg flex">
            {['all', 'drop', 'community', 'exclusive'].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  filter === type 
                    ? 'bg-ledger-primary text-black' 
                    : 'ledger-text-secondary hover:ledger-text-primary'
                }`}
              >
                {type === 'all' ? 'All Events' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* My Tickets */}
        {currentUser && myEventsList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="ledger-card p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <h3 className="font-semibold ledger-text-primary">You have {myEventsList.length} ticket{myEventsList.length !== 1 ? 's' : ''}</h3>
                  <p className="text-sm ledger-text-secondary">
                    {myEventsList.map(e => e.title).join(', ')}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Events Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin ledger-accent" />
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <EventCard 
                    event={event}
                    onBuyTicket={handleBuyTicket}
                    hasTicket={myTickets.has(event.id)}
                    isBuying={isBuying === event.id}
                    currentUser={currentUser}
                  />
                </motion.div>
              ))}
            </div>
          </>
        )}

        {!isLoading && filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 ledger-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-bold ledger-text-primary mb-2">No upcoming events</h3>
            <p className="ledger-text-secondary">Check back soon for new events and drops!</p>
          </div>
        )}

        {/* Auth Gate Modal */}
        <AuthGate 
          isOpen={showAuthGate} 
          onClose={() => setShowAuthGate(false)}
          action="buy tickets"
        />
      </div>
    </div>
  );
}